from django.urls import path
from .views import activity_log_list, activity_log_delete_all, activity_log_delete

urlpatterns = [
   path('logs/', activity_log_list),
   path('logs/delete-all/', activity_log_delete_all),
   path('logs/<int:log_id>/', activity_log_delete),
]
