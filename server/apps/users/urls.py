from django.urls import path
from .views import create_user, delete_user, update_user, login_user, signup_user, get_users, test, deactivate_user, activate_user

urlpatterns = [
    path('login/', login_user),
    path('signup/', signup_user),
    path('get-users/', get_users),
    path('create-user/', create_user),
    path('update-user/', update_user),
    path('deactivate-user/', deactivate_user),
    path('activate-user/', activate_user),
    path('delete-user/<str:user_id>/', delete_user),
    path('test/', test),  # New test endpoint
]
