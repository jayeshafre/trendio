from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer


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
