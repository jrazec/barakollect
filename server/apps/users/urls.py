from django.urls import path
from .views import create_user, delete_user, update_user, login_user, signup_user, get_users, test, deactivate_user, activate_user

urlpatterns = [
    path('login/', login_user), # Add activity Logs - if admin login needed
    path('signup/', signup_user), # Add activity Logs - done
    path('get-users/', get_users),
    path('create-user/', create_user), # Add activity Logs - done
    path('update-user/', update_user), # Add activity Logs - done
    path('deactivate-user/', deactivate_user), # Add activity Logs - done
    path('activate-user/', activate_user), # Add activity Logs - done
    path('delete-user/<str:user_id>/', delete_user), # Add activity Logs - pending
    path('test/', test),  # New test endpoint
]
