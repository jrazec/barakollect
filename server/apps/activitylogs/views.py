from django.utils import timezone
from django.http import JsonResponse
from rest_framework.decorators import api_view
from services.supabase_service import supabase
from models.models import ActivityLog

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
        
        # Converting to response format
        data = []
        for log in response:
            data.append({
                'id': log['id'],
                'timestamp': log['created_at'],
                'user': log['user__first_name'] + ' ' + log['user__last_name'],
                'userType': log['user__userrole__role__name'],
                'action': log['action'],
                # log['description'] example is "status->success;details->Exported Stuffs here;resource->hello.jpg"
                'resource': log['description'].split(';')[2].split('->')[1],
                'status': log['description'].split(';')[0].split('->')[1],
                'details': log['description'].split(';')[1].split('->')[1]
            })

        if not response:
            return JsonResponse({'error': 'No activity logs found'}, status=404)
        return JsonResponse(list(data), safe=False)

    elif request.method == 'DELETE':
        # Delete all activity logs from Supabase
        response = supabase.table('activity_logs').delete().neq('id', 0).execute()
        if response.error:
            return JsonResponse({'error': str(response.error)}, status=400)
        return JsonResponse({'message': 'All activity logs deleted successfully'}, status=200)