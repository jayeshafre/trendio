from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin panel
    path('admin/', admin.site.urls),

    # Authentication API
    path('api/auth/', include('users.urls')),
]