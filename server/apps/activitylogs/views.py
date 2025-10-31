from django.utils import timezone
from django.http import JsonResponse
from rest_framework.decorators import api_view
from services.supabase_service import supabase
from models.models import ActivityLog, Notification, User, Role
from services.activity_logger import log_user_activity, send_notification_to_admins


@api_view(['GET', 'DELETE'])
def activity_log_list(request):
    if request.method == 'GET':
        # Fetch activity logs from Supabase activity logs
        # Get activity logs with related user and role information
        response = ActivityLog.objects.select_related('user__userrole__role').all().values(
            'id',
            'created_at',
            'user__id',
            'user__first_name',
            'user__last_name',
            'user__username',
            'user__userrole__role__name',
            'action',
            'description'
        )
        print(f"DEBUG: Fetched beautified: {list(response)} activity logs from Supabase")
        
        # Converting to response format
        resource = ''
        status = ''
        details = ''
        data = []
        for log in response:
            if log['description'].count('->') == 3 and log['description'].count(';') == 2:
                resource = log['description'].split(';')[2].split('->')[1]
                status = log['description'].split(';')[0].split('->')[1]
                details = log['description'].split(';')[1].split('->')[1]
            else:
                resource = ''
                status = ''
                details = ''

            data.append({
                'id': log['id'],
                'timestamp': log['created_at'],
                'user': (log['user__first_name'] or '') + ' ' + (log['user__last_name'] or ''),
                'userType': log['user__userrole__role__name'],
                'action': log['action'],
                # log['description'] example is "status->success;details->Exported Stuffs here;resource->hello.jpg"

                'resource': resource,
                'status': status,
                'details': details
            })

        if not response:
            return JsonResponse({'error': 'No activity logs found'}, status=404)
        return JsonResponse(list(data), safe=False)

    elif request.method == 'DELETE':
        # Delete all activity logs from database (alternative endpoint)
        try:
            # Get count before deletion for notification
            total_logs = ActivityLog.objects.count()
            
            # Delete all logs using Django ORM instead of Supabase direct call
            response = ActivityLog.objects.all().delete()
            deleted_count = response[0]
            
            if deleted_count == 0:
                # Send notification that no logs were deleted
                send_notification_to_admins(
                    title="Activity Logs Deletion Failed",
                    message="No activity logs were found to delete via bulk endpoint.",
                    notification_type="info"
                )
                return JsonResponse({'error': 'No activity logs to delete'}, status=404)
            
            # Send notification to admins about successful bulk deletion
            send_notification_to_admins(
                title="All Activity Logs Deleted (Bulk)",
                message=f"All activity logs have been permanently deleted via bulk endpoint. Total logs deleted: {deleted_count}.",
                notification_type="error"
            )
            
            # Log the bulk deletion activity
            log_user_activity(
                user_id=None,
                action="DELETE",
                details=f"All activity logs deleted via bulk endpoint; Total count: {deleted_count}",
                resource="ActivityLog",
                status="success"
            )
            
            return JsonResponse({
                'message': 'All activity logs deleted successfully',
                'deleted_count': deleted_count
            }, status=200)
            
        except Exception as e:
            # Send notification about unexpected error
            send_notification_to_admins(
                title="Activity Logs Bulk Deletion Error",
                message=f"Unexpected error occurred during bulk deletion. Error: {str(e)}",
                notification_type="error"
            )
            return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)
    
@api_view(['DELETE'])
def activity_log_delete(request, log_id):
    # Delete a specific activity log by ID from Supabase
    try:
        # Get the log details before deletion for notification
        log_to_delete = ActivityLog.objects.select_related('user').get(id=log_id)
        user_name = f"{log_to_delete.user.first_name} {log_to_delete.user.last_name}" if log_to_delete.user else "Unknown User"
        action = log_to_delete.action
        
        # Delete the log
        response = ActivityLog.objects.filter(id=log_id).delete()
        
        if response[0] == 0:
            # Send notification that log was failed to delete
            send_notification_to_admins(
                title="Activity Log Deletion Failed",
                message=f"Failed to delete activity log with ID: {log_id}. The log may not exist.",
                notification_type="error"
            )
            return JsonResponse({'error': 'Failed to delete activity log'}, status=400)
        
        # Send notification to admins about successful deletion
        send_notification_to_admins(
            title="Activity Log Deleted",
            message=f"Activity log has been deleted successfully. Log ID: {log_id}, User: {user_name}, Action: {action}",
            notification_type="warning"
        )
        
        return JsonResponse({'message': f'Activity log {log_id} deleted successfully'}, status=200)
        
    except ActivityLog.DoesNotExist:
        # Send notification that log was not found
        send_notification_to_admins(
            title="Activity Log Deletion Failed",
            message=f"Cannot delete activity log with ID: {log_id}. Log not found.",
            notification_type="error"
        )
        return JsonResponse({'error': 'Activity log not found'}, status=404)
    except Exception as e:
        # Send notification about unexpected error
        send_notification_to_admins(
            title="Activity Log Deletion Error",
            message=f"Unexpected error occurred while deleting log ID: {log_id}. Error: {str(e)}",
            notification_type="error"
        )
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)

@api_view(['DELETE'])
def activity_log_delete_all(request):
    # Delete all activity logs from database
    try:
        # Get count before deletion for notification
        total_logs = ActivityLog.objects.count()
        
        # Delete all logs
        response = ActivityLog.objects.all().delete()
        deleted_count = response[0]
        
        if deleted_count == 0:
            # Send notification that no logs were deleted
            send_notification_to_admins(
                title="Activity Logs Deletion Failed",
                message="No activity logs were found to delete. The database may already be empty.",
                notification_type="info"
            )
            return JsonResponse({'error': 'No activity logs to delete'}, status=404)
        
        # Send notification to admins about successful bulk deletion
        send_notification_to_admins(
            title="All Activity Logs Deleted",
            message=f"All activity logs have been permanently deleted from the system. Total logs deleted: {deleted_count}. This action cannot be undone.",
            notification_type="error"  # Using error type for critical actions
        )
    
        
        return JsonResponse({
            'message': 'All activity logs deleted successfully',
            'deleted_count': deleted_count
        }, status=200)
        
    except Exception as e:
        # Send notification about unexpected error
        send_notification_to_admins(
            title="Activity Logs Deletion Error",
            message=f"Unexpected error occurred while deleting all activity logs. Error: {str(e)}",
            notification_type="error"
        )
        
     
        
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)