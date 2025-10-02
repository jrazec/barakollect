from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse

# Create your views here.
@api_view(['GET'])
def render_farmer_dashboard(request):
    # query here
    data = [{"area":10}]
    return JsonResponse({'data': data})