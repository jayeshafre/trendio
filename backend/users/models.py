from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    """
    Custom manager that uses EMAIL as the unique identifier
    instead of the default username.
    """

    def create_user(self, email, username, password=None, **extra_fields):
        """
        Creates and saves a regular User.
        """
        if not email:
            raise ValueError('Email address is required')
        if not username:
            raise ValueError('Username is required')

        # Normalize email (converts uppercase to lowercase)
        email = self.normalize_email(email)

        user = self.model(
            email=email,
            username=username,
            **extra_fields
        )
        # Hash the password (never store plain text passwords)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """
        Creates and saves a SuperUser (admin).
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        return self.create_user(email, username, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for Trendio.
    Uses EMAIL for login instead of username.
    """

    email        = models.EmailField(unique=True)
    username     = models.CharField(max_length=150, unique=True)
    first_name   = models.CharField(max_length=150, blank=True)
    last_name    = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_active    = models.BooleanField(default=True)
    is_staff     = models.BooleanField(default=False)
    date_joined  = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    # Use our custom manager
    objects = CustomUserManager()

    # This field is used for login
    USERNAME_FIELD = 'email'

    # Required fields when creating a superuser
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'trendio_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()