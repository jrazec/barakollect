"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "healthy", "message": "Django is running"})

def debug_imports(request):
    try:
        import pandas as pd
        import numpy as np
        return JsonResponse({"status": "success", "pandas": str(pd.__version__), "numpy": str(np.__version__)})
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)})

urlpatterns = [
    path('', health_check, name='health_check'),
    path('debug/', debug_imports, name='debug_imports'),
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),  # <- add this
    path('api/activity/', include('apps.activitylogs.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/beans/', include('apps.beans.urls')),  # <- add this
    path('api/farms/', include('apps.farms.urls')),  # <- add this
    path('api/analytics/', include('apps.analytics.urls')),  # <- add this
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
