from django.urls import path
from .views import render_farmer_dashboard

urlpatterns = [
   path('farmer/dashboard/<str:uiid>', render_farmer_dashboard),
]