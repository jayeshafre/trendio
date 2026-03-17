from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Registration
    path('register/',        views.RegisterView.as_view(),        name='register'),

    # Login / Logout
    path('login/',           views.LoginView.as_view(),           name='login'),
    path('logout/',          views.LogoutView.as_view(),          name='logout'),

    # Token management
    path('token/refresh/',   TokenRefreshView.as_view(),          name='token_refresh'),

    # Profile
    path('profile/',         views.UserProfileView.as_view(),     name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(),  name='change_password'),

    # Password Reset
    path('forgot-password/', views.ForgotPasswordView.as_view(),  name='forgot_password'),
    path('reset-password/<str:uid>/<str:token>/',
         views.ResetPasswordView.as_view(),                        name='reset_password'),
    path('reset-password/<str:uid>/<str:token>/validate/',
         views.ValidateResetTokenView.as_view(),                   name='validate_reset_token'),
]