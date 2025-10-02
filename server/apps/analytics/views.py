from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db import connection
from services.supabase_service import supabase
from models.models import UserImage, User

# Create your views here.
@api_view(['GET'])
def render_farmer_dashboard(request, uiid):
    # query here
    # Get the location_id of the current user
    location_id = User.objects.filter(id=uiid).values('location_id').first()
    # Print the values in beautification
    print(location_id)
    with connection.cursor() as cursor:
        cursor.execute("SELECT major_axis_length,area FROM extracted_features JOIN predictions ON extracted_features.prediction_id = predictions.id JOIN images ON predictions.image_id = images.id WHERE images.location_id = %s;", [location_id['location_id']])
        data = cursor.fetchall()
    return JsonResponse({'data': (data[0][0] if data[0][0] is not None else 0)})