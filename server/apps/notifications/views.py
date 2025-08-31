from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from models.models import Notification

# Create your views here.

@api_view(['GET'])
def notification_list(request):
    notifications = Notification.objects.all()
    data = []
    """
     /*
     id: '1',
            title: 'New Bean Sample Uploaded',
            message: 'A new bean sample has been uploaded for validation.',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'info',
    */
    """
    for notification in notifications:
        data.append({
            'id': notification.id,
            #The notification.message is templated as => "title","message","type"
            'title': (notification.message.split(',')[0].replace('"', '')) or 'Notification',
            'message': (notification.message.split(',')[1].replace('"', '')) or 'Not Available',
            'type': (notification.message.split(',')[2].replace('"', '')) or 'info',
            'read' : False,
            'created_at': notification.created_at,
        })
    return JsonResponse(data, safe=False)
