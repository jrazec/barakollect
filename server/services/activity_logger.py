from django.utils import timezone
from models.models import ActivityLog, Notification, User, Role

def log_user_activity(user_id, action, resource, status, details):
    """
    Logs user activity to the ActivityLog model.
    # log['description'] example is "status->success;details->Exported Stuffs here;resource->hello.jpg"
    Description format: "status->{status};details->{details};resource->{resource}"
    1. user_id: ID of the user performing the action
    2. action: Action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', etc.)
    3. resource: The resource involved in the action (e.g., 'Farm', 'Bean', etc.)
    4. status: Status of the action (e.g., 'success', 'failure')
    5. details: Additional details about the action
    6. created_at: Timestamp of when the action occurred
    """
    try:
        description = f"status->{status};details->{details};resource->{resource}"
        if user_id == "admin" or user_id is None:
            user_id = '21f37816-2618-4838-b3ce-d83ef7ae1418'  # Default admin user ID for logging purposes
        ActivityLog.objects.create(
            user_id=user_id,
            action=action,
            description=description,
            created_at=timezone.now()
        )
        print(f"Logged activity for user {user_id}: {action} - {description}")

    except Exception as e:
        print(f"Error logging activity for user {user_id}: {e}")

def send_notification_to_admins(title, message, notification_type='warning'):
    """
    Send notification to all admin users
    """
    try:
        # Get all admin users by role
        admin_role = Role.objects.get(name='admin')
        admin_users = User.objects.filter(
            userrole__role=admin_role,
            is_active=True
        )
        
        # Create notifications for all admin users
        for admin_user in admin_users:
            Notification.objects.create(
                user=admin_user,
                title=title,
                message=message,
                type=notification_type
            )
        
        print(f"Notification sent to {admin_users.count()} admin(s): {title}")
        return True
        
    except Role.DoesNotExist:
        print("Admin role not found")
        return False
    except Exception as e:
        print(f"Error sending notification to admins: {e}")
        return False

