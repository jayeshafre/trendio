from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin configuration for Trendio users.
    """
    model = CustomUser

    # Columns shown in the user list
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'is_active')
    list_filter  = ('is_staff', 'is_active')

    # Fields shown when editing a user
    fieldsets = (
        ('Login Info',    {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'first_name', 'last_name', 'phone_number')}),
        ('Permissions',   {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )

    # Fields shown when CREATING a new user in admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )

    search_fields = ('email', 'username')
    ordering      = ('email',)
