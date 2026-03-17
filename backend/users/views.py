from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_bytes, smart_str, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user account.
    No authentication required.
    """
    queryset         = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can register

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Account created successfully. Welcome to Trendio!',
            'user': {
                'id':         user.id,
                'email':      user.email,
                'username':   user.username,
                'first_name': user.first_name,
                'last_name':  user.last_name,
            },
            'tokens': {
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Login with email and password.
    Returns JWT access and refresh tokens.
    No authentication required.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email    = request.data.get('email')
        password = request.data.get('password')

        # Validate input
        if not email or not password:
            return Response(
                {'error': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user
        user = authenticate(request, username=email, password=password)

        if not user:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Your account has been deactivated.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': f'Welcome back, {user.first_name or user.username}!',
            'user': {
                'id':         user.id,
                'email':      user.email,
                'username':   user.username,
                'first_name': user.first_name,
                'last_name':  user.last_name,
            },
            'tokens': {
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Logout by blacklisting the refresh token.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()   # Invalidate the token

            return Response(
                {'message': 'Logged out successfully.'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/profile/   → View profile
    PUT  /api/auth/profile/   → Update profile
    Authentication required.
    """
    serializer_class   = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Return the currently logged-in user
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'Profile updated successfully.',
            'user': serializer.data
        })


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Change password for logged-in user.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # Check old password is correct
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response(
            {'message': 'Password changed successfully. Please login again.'},
            status=status.HTTP_200_OK
        )

class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Send password reset email to user.
    No authentication required.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user  = CustomUser.objects.get(email=email)

        # Generate secure token
        token     = PasswordResetTokenGenerator().make_token(user)
        uid       = urlsafe_base64_encode(smart_bytes(user.id))

        # Build reset URL (frontend URL)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        # Send email
        send_mail(
            subject = 'Trendio — Password Reset Request',
            message = f"""
Hello {user.first_name or user.username},

You requested a password reset for your Trendio account.

Click the link below to reset your password:
{reset_url}

This link will expire in 24 hours.

If you did not request this, please ignore this email.

— The Trendio Team
            """,
            from_email    = settings.DEFAULT_FROM_EMAIL,
            recipient_list = [email],
            fail_silently  = False,
        )

        return Response({
            'message': f'Password reset link sent to {email}. Please check your inbox.'
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/<uid>/<token>/
    Reset password using token from email.
    No authentication required.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, uid, token):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Decode user ID
            user_id = smart_str(urlsafe_base64_decode(uid))
            user    = CustomUser.objects.get(id=user_id)

            # Verify token is valid
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response(
                    {'error': 'Reset link is invalid or has expired. Please request a new one.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({
                'message': 'Password reset successful! You can now login with your new password.'
            }, status=status.HTTP_200_OK)

        except (CustomUser.DoesNotExist, ValueError, TypeError):
            return Response(
                {'error': 'Invalid reset link. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ValidateResetTokenView(APIView):
    """
    GET /api/auth/reset-password/<uid>/<token>/validate/
    Check if reset token is still valid before showing reset form.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, uid, token):
        try:
            user_id = smart_str(urlsafe_base64_decode(uid))
            user    = CustomUser.objects.get(id=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response(
                    {'valid': False, 'error': 'Reset link is invalid or has expired.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {'valid': True, 'email': user.email},
                status=status.HTTP_200_OK
            )

        except (CustomUser.DoesNotExist, ValueError, TypeError):
            return Response(
                {'valid': False, 'error': 'Invalid reset link.'},
                status=status.HTTP_400_BAD_REQUEST
            )