from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import upload_beans, get_user_beans, process_bean

urlpatterns = [
   path('upload/', upload_beans),
   path('get-list/<str:user_id>/', get_user_beans),
   path('process/', process_bean),
]


# Serve media in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)