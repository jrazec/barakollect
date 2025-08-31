from django.utils import timezone
from models.models import ActivityLog

def log_user_activity(user_id, action,description):
    try:
        ActivityLog.objects.create(
            user_id=user_id,
            action=action,
            description=description,
            created_at=timezone.now()
        )
        print(f"Logged activity for user {user_id}: {action} - {description}")

    except Exception as e:
        print(f"Error logging activity for user {user_id}: {e}")
