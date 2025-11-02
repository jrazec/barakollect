from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from models.models import Notification, User
from services.activity_logger import log_user_activity

# Temporary email sending function - placeholder for future implementation
def send_email_notification(user_email, title, message, notification_type):
    """
    Temporary placeholder for email sending functionality.
    In the future, this will integrate with an email service like SendGrid, AWS SES, etc.
    """
    # print(f"[EMAIL PLACEHOLDER] Sending email to {user_email}")
    # print(f"Subject: {title}")
    # print(f"Message: {message}")
    # print(f"Type: {notification_type}")
    # print("---")
    # TODO: Implement actual email sending logic
    pass

def get_all_user_emails():
    """
    Temporary function to get all user emails from Supabase Auth.
    In the future, this will query Supabase Auth API to get all user emails.
    """
    # TODO: Implement Supabase Auth API call to get all user emails
    # For now, we'll use the emails from our User model as a placeholder
    users = User.objects.all()
    return [user.email for user in users if user.email]

# Create your views here.

@api_view(['GET'])
def notification_list(request, user_id=None):
    notifications = Notification.objects.all()
    if user_id:
        notifications = notifications.filter(user__id=user_id).order_by('-created_at')
    data = []
    """
     /*
     id: '1',
            title: 'New Bean Sample Uploaded',
            message: 'A new bean sample has been uploaded for validation.',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'info',
        
    """
    for notification in notifications:
        data.append({
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'type': notification.type,
            'is_read' : notification.is_read,
            'created_at': notification.created_at,
        })
    return JsonResponse(data, safe=False)



@api_view(['POST'])
def mark_as_read(request):
    try:
        notification_id = request.data.get('notification_id')
        notification = Notification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save()
        return Response({'status': 'success', 'message': 'Notification marked as read.'})
    except Notification.DoesNotExist:
        return Response({'status': 'error', 'message': 'Notification not found.'}, status=404)

@api_view(['POST'])
def mark_all_as_read(request):
    user_id = request.data.get('user_id')
    notifications = Notification.objects.filter(user__id=user_id, is_read=False)
    notifications.update(is_read=True)
    return Response({'status': 'success', 'message': 'All notifications marked as read.'})

@api_view(['POST'])
def send_broadcast_notification(request):
    title = request.data.get('title')
    message = request.data.get('message')
    notification_type = request.data.get('type')

    if not title or not message or not notification_type:
        return Response({'status': 'error', 'message': 'Title, message, and type are required.'}, status=400)

    users = User.objects.all()
    
    # Create notifications for all users
    for user in users:
        Notification.objects.create(user=user, title=title, message=message, type=notification_type)
    
    # Send emails to all users (temporary placeholder)
    try:
        user_emails = get_all_user_emails()
        for email in user_emails:
            send_email_notification(email, title, message, notification_type)
        # Log success
        log_user_activity(
                user_id=None,
                action="CREATE",
                details=f"Broadcast notification sent: {title}",
                resource="Notification",
                status="success"
        )
    except Exception as e:
        print(f"Email sending failed: {e}")
        # Don't fail the entire operation if email sending fails
        log_user_activity(
                user_id=None,
                action="CREATE",
                details=f"Broadcast notification sent with email failures.",
                resource="Notification",
                status="failed"
        )
    
    return Response({'status': 'success', 'message': 'Broadcast notification sent to all users.'})

@api_view(['POST'])
def send_personal_notification(request):
    user_id = request.data.get('user_id')
    title = request.data.get('title')
    notification_type = request.data.get('type')
    message = request.data.get('message')
    
    if not user_id or not message or not title or not notification_type:
        return Response({'status': 'error', 'message': 'User ID and message content are required.'}, status=400)
    
    try:
        user = User.objects.get(id=user_id)
        Notification.objects.create(user=user, title=title, message=message, type=notification_type)
        
        # Send email to the specific user (temporary placeholder)
        try:
            if user.email:
                send_email_notification(user.email, title, message, notification_type)
                log_user_activity(
                    user_id=user_id,
                    action="CREATE",
                    details=f"Personal notification sent: {title}",
                    resource="Notification",
                    status="success"
                )
        except Exception as e:
            print(f"Email sending failed for user {user_id}: {e}")
            log_user_activity(
                user_id=user_id,
                action="CREATE",
                details=f"Personal notification sent with email failure.",
                resource="Notification",
                status="failed"
            )
            # Don't fail the entire operation if email sending fails
        
        return Response({'status': 'success', 'message': 'Notification sent to user.'})
    except User.DoesNotExist:
        log_user_activity(
            user_id=user_id,
            action="CREATE",
            details=f"Personal notification failed. User not found.",
            resource="Notification",
            status="failed"
        )
        return Response({'status': 'error', 'message': 'User not found.'}, status=404)


@api_view(['DELETE'])
def clear_notifications(request):
    user_id = request.data.get('user_id')
    
    if not user_id:
        return Response({'status': 'error', 'message': 'User ID is required.'}, status=400)
    
    try:
        # Delete all notifications for the user
        deleted_count = Notification.objects.filter(user__id=user_id).delete()[0]
        return Response({
            'status': 'success', 
            'message': f'{deleted_count} notifications cleared for user.',
            'deleted_count': deleted_count
        })
    except Exception as e:
        return Response({'status': 'error', 'message': f'Failed to clear notifications: {str(e)}'}, status=500)