from django.urls import path
from .views import get_farms, create_farm, update_farm_location, get_farm_details, delete_farm, get_farm_view

urlpatterns = [
    path('get-farms/', get_farms),
    path('create/', create_farm),
    path('delete/', delete_farm),
    path('<str:farm_id>/', get_farm_details),
    path('<str:farm_id>/view/', get_farm_view),
    path('<str:farm_id>/location/', update_farm_location),

]
