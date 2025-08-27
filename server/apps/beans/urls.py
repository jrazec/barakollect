from django.urls import path
from .views import upload_beans, get_user_beans

urlpatterns = [
   path('upload/', upload_beans),
   path('get-list/<str:user_id>/', get_user_beans),
]
