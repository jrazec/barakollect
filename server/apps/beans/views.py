from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.utils import timezone
import uuid
import json
import random
from services.supabase_service import supabase
from models.models import User,UserImage
from models.models import Image as ImageBucket

from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .bean_feature_extract import BeanFeatureExtractor
import cv2
import numpy as np
from PIL import Image
import os
from django.conf import settings


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
    user_images = ImageBucket.objects.filter(userimage__user_id=user_id).values("image_url", "upload_date", "id",  "userimage__user__location", "userimage__user__first_name", "userimage__user__last_name", "userimage__user__userrole__role__name", "userimage__user__id","userimage__image__prediction__predicted_label__bean_type", "userimage__image__prediction__predicted_label__confidence","userimage__image__annotation__label__is_validated")
    beans = supabase.storage.from_("Beans").list(f"uploads/{user_id}/")

    data = []
    for img in user_images:
        signed = supabase.storage.from_("Beans").create_signed_url(
            img["image_url"], 3600
        )
        data.append({
            "src":signed["signedURL"],
            "upload_date": img["upload_date"],
            "id": img["id"],
            "userId": img["userimage__user__id"],
            "location": img["userimage__user__location"],
            "userName": f"{img['userimage__user__first_name']} {img['userimage__user__last_name']}",
            "userRole": img["userimage__user__userrole__role__name"],
            # Placeholder fields
            "bean_type": None,
            "is_validated": True if img["userimage__image__annotation__label__is_validated"] == 1 else False, 
            "predictions":{
                "bean_type": img["userimage__image__prediction__predicted_label__bean_type"] if img["userimage__image__prediction__predicted_label__bean_type"] else "unknown",
                "confidence": img["userimage__image__prediction__predicted_label__confidence"] if img["userimage__image__prediction__predicted_label__confidence"] else 0.0,
            },
            "submissionDate": img["upload_date"],
            "allegedVariety": None
        })

    return JsonResponse({"images":data})



extractor = BeanFeatureExtractor()

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def process_bean(request):
    try:
        file_obj = request.data['image']
    except KeyError:
        return Response({"error": "No image provided"}, status=400)

    # Convert uploaded image → OpenCV format
    img = Image.open(file_obj)
    img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # Run bean feature extraction
    black_bg, mask, gray = extractor.preprocess_image(img)
    features, bbox = extractor.extract_features(mask, gray)

    if features is None:
        return Response({"error": "No bean detected"}, status=400)

    # Draw bounding box
    debug_img = extractor.draw_bbox(img, bbox)

    # Encode to base64 for frontend
    _, buffer = cv2.imencode('.png', debug_img)
    filename = f"{uuid.uuid4()}.png"
    folder = os.path.join(settings.MEDIA_ROOT, "processed")
    os.makedirs(folder, exist_ok=True)  # ensure folder exists

    filepath = os.path.join(folder, filename)
    cv2.imwrite(filepath, debug_img)

    img_str = settings.MEDIA_URL + "processed/" + filename

    return Response({
        "features": features,
        "processed_image": img_str
    })
