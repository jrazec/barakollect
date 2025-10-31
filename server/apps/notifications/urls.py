from django.urls import path
from .views import notification_list, mark_as_read, mark_all_as_read, send_broadcast_notification, send_personal_notification, clear_notifications

urlpatterns = [
   path('get-list/<str:user_id>/', notification_list),
   path('mark-as-read/', mark_as_read),
   path('mark-all-as-read/', mark_all_as_read),
   path('admin/broadcast/', send_broadcast_notification), # Add activity Logs - done
   path('send-personal/', send_personal_notification), # Add activity Logs - done
   path('clear/', clear_notifications), # Add activity Logs - done
]
