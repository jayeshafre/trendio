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
]