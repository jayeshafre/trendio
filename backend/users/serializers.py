from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_str
from django.utils.http import urlsafe_base64_decode

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Handles validation and user creation.
    """

    password  = serializers.CharField(
        write_only=True,      # Never returned in response
        required=True,
        validators=[validate_password]  # Django's built-in password rules
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:
        model  = CustomUser
        fields = ('email', 'username', 'first_name', 'last_name', 'phone_number', 'password', 'password2')

    def validate(self, attrs):
        """Check that both passwords match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        """Create and return a new user."""
        # Remove password2 — we don't need it after validation
        validated_data.pop('password2')

        user = CustomUser.objects.create_user(
            email        = validated_data['email'],
            username     = validated_data['username'],
            password     = validated_data['password'],
            first_name   = validated_data.get('first_name', ''),
            last_name    = validated_data.get('last_name', ''),
            phone_number = validated_data.get('phone_number', '')
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing and updating user profile.
    """

    class Meta:
        model  = CustomUser
        fields = (
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'phone_number',
            'date_joined',
            'is_staff',       
            'is_superuser',    
        )
        read_only_fields = (
            'id',
            'email',
            'date_joined',
            'is_staff',
            'is_superuser',
        )


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "New passwords do not match."})
        return attrs
    
class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer for forgot password request.
    Takes email and sends reset link.
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        # Check if user with this email exists
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "No account found with this email address."
            )
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for resetting password using token.
    """
    new_password  = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(
        required=True,
        write_only=True
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {"new_password": "Passwords do not match."}
            )
        return attrs