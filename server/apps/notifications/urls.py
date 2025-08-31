from django.urls import path
from .views import notification_list

urlpatterns = [
   path('get-list/', notification_list),
]
