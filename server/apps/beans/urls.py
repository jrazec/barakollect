from django.urls import path
from .views import upload_beans, get_user_beans, process_bean, process_single_bean, get_bean_detections, test_database_connection, get_all_beans, validate_beans, get_annotations, delete_bean, upload_records, upload_images

urlpatterns = [
   path('upload/', upload_beans), 
   path('get-images/', get_all_beans), 
   path('get-annotations/', get_annotations),
   path('validate/',validate_beans), # Add activity Logs - done
   path('images/<int:image_id>',delete_bean), # Add activity Logs - done
   path('get-list/<str:user_id>/', get_user_beans),
   path('process/', process_bean), # Add activity Logs - done
   path('process-single/', process_single_bean),  # Add activity Logs - done
   path('detections/<str:user_id>/', get_bean_detections), 
   path('test-db/', test_database_connection),
   path('upload-records/', upload_records), # Upload CSV data as JSON
   path('upload-images/', upload_images), # Upload ZIP file with images
]