from django.urls import path
from .views import upload_beans, get_user_beans, process_bean, process_single_bean, get_bean_detections, test_database_connection

urlpatterns = [
   path('upload/', upload_beans),
   path('get-list/<str:user_id>/', get_user_beans),
   path('process/', process_bean),
   path('process-single/', process_single_bean),  # Backward compatibility
   path('detections/<str:user_id>/', get_bean_detections),
   path('test-db/', test_database_connection),
]