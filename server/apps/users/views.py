from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from rest_framework.decorators import api_view

@api_view(['GET'])
def test_connection(request):
    return JsonResponse({"message": "Hello from Django backend!"})