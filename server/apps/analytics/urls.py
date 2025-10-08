from django.urls import path
from .views import render_farmer_dashboard, render_admin_dashboard

urlpatterns = [
   path('farmer/dashboard/<str:uiid>', render_farmer_dashboard),
   path('admin/dashboard/',render_admin_dashboard)
]