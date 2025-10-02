from django.urls import path
from .views import render_farmer_dashboard

urlpatterns = [
   path('farmer/dashboard/', render_farmer_dashboard),
]