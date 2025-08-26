from django.urls import path
from .views import activity_log_list

urlpatterns = [
   path('logs/', activity_log_list),
]
