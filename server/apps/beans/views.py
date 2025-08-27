from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.utils import timezone
import uuid
from services.supabase_service import supabase
from models.models import User,Image,UserImage


# Create your views here.

@api_view(['POST'])
def upload_beans(request):
    user_id = request.data.get('user_id')
    
    # Handle single image
    single_file = request.FILES.get('image')
    # Handle multiple images
    multiple_files = request.FILES.getlist('images')
    
    files_to_process = []
    if single_file:
        files_to_process.append(single_file)
    if multiple_files:
        files_to_process.extend(multiple_files)
    
    if not files_to_process:
        return JsonResponse({"error": "No image file(s) provided"}, status=400)
    
    uploaded_files = []
    
    for file in files_to_process:
        path = f"uploads/{user_id}/{uuid.uuid4()}.{file.name.split('.')[-1]}"
        
        try:
            UserImage.objects.create(
                is_deleted=False,
                user_id=user_id,
                image=Image.objects.create(image_url=path, upload_date=timezone.now())
            )
            upload = supabase.storage.from_("Beans").upload(path, file.read())
            uploaded_files.append(path)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({
        "message": f"{len(uploaded_files)} file(s) uploaded successfully",
        "uploaded_files": uploaded_files
    }, status=201)

@api_view(['GET'])
def get_user_beans(request, user_id):
    # Logic for retrieving beans
    user_images = Image.objects.filter(userimage__user_id=user_id).values("image_url", "upload_date", "id")
    beans = supabase.storage.from_("Beans").list(f"uploads/{user_id}/")

    urls = []
    for img in user_images:
        signed = supabase.storage.from_("Beans").create_signed_url(
            img["image_url"], 3600
        )
        urls.append(signed["signedURL"])

    return JsonResponse({"images": urls})
