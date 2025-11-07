from django.urls import path
from .views import render_farmer_dashboard, render_admin_dashboard, system_status

urlpatterns = [
   path('farmer/dashboard/<str:uiid>', render_farmer_dashboard),
   path('admin/dashboard/',render_admin_dashboard),
   path('admin/system-status/', system_status),
]