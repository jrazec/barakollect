from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.utils import timezone
from django.db import connection
from django.db import transaction
from django.core.paginator import Paginator
import uuid
import json
import random
import traceback
from services.activity_logger import log_user_activity
from services.supabase_service import supabase
from models.models import ActivityLog, Annotation, User, UserImage, BeanDetection, Prediction, ExtractedFeature,UserRole, Location
from models.models import Image as ImageBucket

from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .bean_feature_extract import BeanFeatureExtractor
from .serializers import MultipleImageUploadSerializer, BeanProcessingResultSerializer
import cv2
import numpy as np
from PIL import Image
import os
import zipfile
from io import BytesIO
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
    try:
        print(f"DEBUG: Starting optimized get_user_beans for user_id={user_id}")
        
        # Step 1: Get all image data for the user with all related data in ONE query
        print("DEBUG: Executing main query with cursor for maximum performance")
        
        with connection.cursor() as cursor:
            # Main query that fetches everything we need in one go - similar to get_all_beans but filtered by user_id
            main_query = """
                SELECT DISTINCT
                    i.id as image_id,
                    i.image_url,
                    i.upload_date,
                    u.id as user_id,
                    u.first_name,
                    u.last_name,
                    r.name as role_name,
                    loc.id as location_id,
                    loc.name as location_name,
                    a.label->>'is_validated' as is_validated,
                    p.id as prediction_id,
                    p.predicted_label->>'bean_type' as bean_type,
                    p.predicted_label->>'confidence' as confidence,
                    ef.area,
                    ef.perimeter,
                    ef.major_axis_length,
                    ef.minor_axis_length,
                    ef.extent,
                    ef.eccentricity,
                    ef.convex_area,
                    ef.solidity,
                    ef.mean_intensity,
                    ef.equivalent_diameter,
                    ef.id as extracted_feature_id
                FROM images i
                INNER JOIN user_images ui ON i.id = ui.image_id
                INNER JOIN users u ON ui.user_id = u.id
                INNER JOIN user_roles ur ON u.id = ur.user_id
                INNER JOIN roles r ON ur.role_id = r.id
                LEFT JOIN locations loc ON u.location_id = loc.id
                LEFT JOIN annotations a ON i.id = a.image_id
                LEFT JOIN predictions p ON i.id = p.image_id
                LEFT JOIN extracted_features ef ON p.id = ef.prediction_id
                WHERE ui.is_deleted = false AND u.id = %s
                ORDER BY i.upload_date DESC
            """
            
            cursor.execute(main_query, [user_id])
            all_rows = cursor.fetchall()
            
            print(f"DEBUG: Fetched {len(all_rows)} rows from main query")
            
            # Step 2: Get bean detections for all images in one query
            if all_rows:
                image_ids = list(set(row[0] for row in all_rows))  # Get unique image IDs
                
                bean_query = """
                    SELECT 
                        p.image_id,
                        bd.bean_id,
                        bd.length_mm,
                        bd.width_mm,
                        bd.bbox_x,
                        bd.bbox_y,
                        bd.bbox_width,
                        bd.bbox_height,
                        bd.comment,
                        bd.created_at,
                        ef.id as extracted_feature_id
                    FROM bean_detections bd
                    JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                    JOIN predictions p ON ef.prediction_id = p.id
                    WHERE p.image_id = ANY(%s)
                    ORDER BY p.image_id, bd.bean_id
                """
                
                cursor.execute(bean_query, [image_ids])
                bean_rows = cursor.fetchall()
                
                print(f"DEBUG: Fetched {len(bean_rows)} bean detection rows")
            else:
                bean_rows = []
        
        # Step 3: Process data in memory (NO database queries in this section)
        print("DEBUG: Processing data in memory")
        
        # Group main data by image_id
        images_data = {}
        for row in all_rows:
            image_id = row[0]
            if image_id not in images_data:
                images_data[image_id] = {
                    'image_id': row[0],
                    'image_url': row[1],
                    'upload_date': row[2],
                    'user_id': row[3],
                    'first_name': row[4],
                    'last_name': row[5],
                    'role_name': row[6],
                    'location_id': row[7],
                    'location_name': row[8],
                    'is_validated': row[9],  # Already extracted from JSON
                    'prediction_id': row[10],
                    'bean_type': row[11],  # Already extracted from JSON
                    'confidence': row[12],  # Already extracted from JSON
                    'extracted_features': {
                        'area': row[13],
                        'perimeter': row[14],
                        'major_axis_length': row[15],
                        'minor_axis_length': row[16],
                        'extent': row[17],
                        'eccentricity': row[18],
                        'convex_area': row[19],
                        'solidity': row[20],
                        'mean_intensity': row[21],
                        'equivalent_diameter': row[22],
                        'extracted_feature_id': row[23]
                    } if row[13] is not None else None
                }
        
        print(f"DEBUG: Processed {len(images_data)} unique images from main query")
    
        # Group bean detections by image_id
        beans_by_image = {}
        for bean_row in bean_rows:
            image_id = bean_row[0]
            if image_id not in beans_by_image:
                beans_by_image[image_id] = []
            
            beans_by_image[image_id].append({
                'bean_id': bean_row[1],
                'length_mm': float(bean_row[2]),
                'width_mm': float(bean_row[3]),
                'bbox_x': bean_row[4],
                'bbox_y': bean_row[5],
                'bbox_width': bean_row[6],
                'bbox_height': bean_row[7],
                'comment': bean_row[8] or "",
                'created_at': bean_row[9],
                'extracted_feature_id': bean_row[10]
            })
        
        # Step 4: Build response data (NO database queries)
        data = []
        print("DEBUG: Building response data from in-memory data")
        
        # Create extracted features lookup for efficient access
        extracted_features_data = {}
        for row in all_rows:
            if row[23] is not None:  # extracted_feature_id
                extracted_features_data[row[23]] = {
                    'area': row[13],
                    'perimeter': row[14],
                    'major_axis_length': row[15],
                    'minor_axis_length': row[16],
                    'extent': row[17],
                    'eccentricity': row[18],
                    'convex_area': row[19],
                    'solidity': row[20],
                    'mean_intensity': row[21],
                    'equivalent_diameter': row[22],
                    'confidence': row[12],
                }
        
        for img_data in images_data.values():
            try:
                image_id = img_data['image_id']
                
                # Generate public URL for image
                try:
                    publicUrl = supabase.storage.from_("Beans").get_public_url(
                        img_data['image_url']
                    )
                except Exception as e:
                    print(f"DEBUG: Error generating public URL for image {image_id}: {str(e)}")
                    publicUrl = ""
                
                # Get validation status from pre-extracted data
                is_validated_str = img_data['is_validated']
                is_validated = is_validated_str == 'true' if is_validated_str else False
                
                # Get bean detections from pre-fetched data
                bean_detections = beans_by_image.get(image_id, [])
                predictions = []
                
                # Process predictions using pre-extracted data
                bean_type = img_data['bean_type']

                for detection in bean_detections:
                    features = extracted_features_data.get(detection['extracted_feature_id'], {})
                    confidence = float(extracted_features_data[detection['extracted_feature_id']]['confidence']) if img_data['confidence'] else 0.8
                    predictions.append({
                        "bean_id": detection['bean_id'],
                        "is_validated": is_validated,
                        "bean_type": bean_type,
                        "confidence": confidence,
                        "length_mm": detection['length_mm'],
                        "width_mm": detection['width_mm'],
                        "bbox": [detection['bbox_x'], detection['bbox_y'], 
                                detection['bbox_width'], detection['bbox_height']],
                        "comment": detection['comment'],
                        "detection_date": detection['created_at'],
                        "features": {
                            "area_mm2": float(features.get('area')) if features.get('area') else None,
                            "perimeter_mm": float(features.get('perimeter')) if features.get('perimeter') else None,
                            "major_axis_length_mm": float(features.get('major_axis_length')) if features.get('major_axis_length') else None,
                            "minor_axis_length_mm": float(features.get('minor_axis_length')) if features.get('minor_axis_length') else None,
                            "extent": float(features.get('extent')) if features.get('extent') else None,
                            "eccentricity": float(features.get('eccentricity')) if features.get('eccentricity') else None,
                            "convex_area_mm2": float(features.get('convex_area')) if features.get('convex_area') else None,
                            "solidity": float(features.get('solidity')) if features.get('solidity') else None,
                            "mean_intensity": float(features.get('mean_intensity')) if features.get('mean_intensity') else None,
                            "equivalent_diameter_mm": float(features.get('equivalent_diameter')) if features.get('equivalent_diameter') else None
                        },
                        "extracted_feature_id": detection['extracted_feature_id']
                    })
                
                data.append({
                    "src": publicUrl,
                    "upload_date": img_data['upload_date'],
                    "id": img_data['image_id'],
                    "userId": img_data['user_id'],
                    "location_id": img_data['location_id'],
                    "userName": f"{img_data['first_name']} {img_data['last_name']}",
                    "userRole": img_data['role_name'],
                    "bean_type": None,  # Placeholder field
                    "predictions": predictions,
                    "submissionDate": img_data['upload_date'],
                    "allegedVariety": None
                })
                
            except Exception as e:
                print(f"DEBUG: Error processing image {image_id}: {str(e)}")
                continue
        
        print(f"DEBUG: Finished processing. Built response with {len(data)} images")
        return JsonResponse({"images": data})

    except Exception as e:
        print(f"DEBUG: MAIN ERROR in get_user_beans: {str(e)}")
        import traceback
        print(f"DEBUG: FULL TRACEBACK: {traceback.format_exc()}")
        return JsonResponse({"error": str(e)}, status=500)

extractor = BeanFeatureExtractor()

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def process_bean(request):
    """
    Process single or multiple images for bean detection and feature extraction
    """
    system_settings = {}

    # Fetch system settings from the database
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT save_image, accept_predictions, image_accepted_count
            FROM public.plans
            LIMIT 1
        """)
        row = cursor.fetchone()
        if row:
            system_settings = {
                'save_images': row[0],
                'accept_predictions': row[1],
                'max_images': row[2]
            }
        else:
            system_settings = {
                'save_images': True,
                'accept_predictions': True,
                'max_images': 5
            }

    if system_settings['accept_predictions'] is False:
        return Response({"error": "System is not accepting predictions at this time."}, status=403)

    

    # Handle both single image and multiple images
    images = []
    
    # Check for single image first
    if 'image' in request.FILES:
        images.append(request.FILES['image'])
    
    # Check for multiple images (this will override single image if both are present)
    if 'images' in request.FILES:
        images = request.FILES.getlist('images')
    
    # If no standard fields, check for any field starting with 'image'
    if not images:
        for key in request.FILES:
            if key.startswith('image'):
                file_list = request.FILES.getlist(key)
                images.extend(file_list)
                break  # Only take the first matching field to avoid duplicates
    
    if not images:
        return Response({"error": "No images provided"}, status=400)
    
    # Debug: Log the number of images received
    print(f"DEBUG: Processing {len(images)} images")
    for i, img in enumerate(images):
        print(f"DEBUG: Image {i+1}: {img.name if hasattr(img, 'name') else 'unknown'}")
    
    # Remove duplicates based on file content (in case same file is uploaded multiple times)
    unique_images = []
    seen_hashes = set()
    
    for img in images:
        img.seek(0)  # Reset file pointer
        content = img.read()
        img.seek(0)  # Reset again for processing
        
        # Create a simple hash of the content
        content_hash = hash(content)
        if content_hash not in seen_hashes:
            seen_hashes.add(content_hash)
            unique_images.append(img)
        else:
            print(f"DEBUG: Skipping duplicate image: {img.name if hasattr(img, 'name') else 'unknown'}")
    
    images = unique_images
    print(f"DEBUG: After deduplication: {len(images)} unique images")
    
    # Get optional parameters
    comment = request.data.get('comment', '')
    save_to_db = request.data.get('save_to_db', 'true').lower() == 'true'  # Default to true for saving
    user_id = request.data.get('user_id', None)
    
    # Debug: Log the received parameters
    print(f"DEBUG: comment='{comment}', save_to_db={save_to_db}, user_id='{user_id}'")
    print(f"DEBUG: request.data keys: {list(request.data.keys())}")
    
    # Validate required parameters for database saving
    if save_to_db and not user_id:
        return Response({"error": "user_id is required when save_to_db is true"}, status=400)
    
    # Create folder for processed images
    folder = os.path.join(settings.MEDIA_ROOT, "processed")
    os.makedirs(folder, exist_ok=True)
    
    results = []
    
    for img_index, file_obj in enumerate(images):
        try:
            # Convert uploaded image to OpenCV format
            img = Image.open(file_obj)
            img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            
            # Generate unique image ID
            image_id = str(uuid.uuid4())
            
            # Step 1: Extract millimeters per pixel
            calibration_result = extractor.extract_mm_per_px(img)
            if calibration_result is False:
                results.append({
                    "image_id": image_id,
                    "error": "Calibration marker not found",
                    "beans": []
                })
                continue
            
            img_debug, h_mm, w_mm = calibration_result
            
            # Step 2: Preprocess and detect beans
            black_bg, mask, gray, bean_bboxes, predictions = extractor.preprocess_image(img)
            
            # Step 3: Extract features for all beans
            all_beans = extractor.extract_features_for_all_beans(mask, gray, bean_bboxes, predictions)
            
            # Add comment to each bean if provided
            for bean in all_beans:
                if comment:
                    bean['comment'] = comment
            
            # Step 4: Skip debug image creation - commented out for performance
            # debug_img = extractor.draw_bbox(img, bean_bboxes)
            
            # # Save processed images
            # debug_filename = extractor.save_temporary_image(debug_img, folder, f"debug_{image_id}")
            # calibration_filename = extractor.save_temporary_image(img_debug, folder, f"calib_{image_id}")
            # processed_filename = extractor.save_temporary_image(black_bg, folder, f"processed_{image_id}")
            
            # # Build URLs - ensure proper URL construction
            # base_url = request.build_absolute_uri('/').rstrip('/')
            # debug_url = f"{base_url}{settings.MEDIA_URL}processed/{debug_filename}"
            # calibration_url = f"{base_url}{settings.MEDIA_URL}processed/{calibration_filename}"
            # processed_url = f"{base_url}{settings.MEDIA_URL}processed/{processed_filename}"

            # Initialize debug URLs - will be set after database save if applicable
            debug_url = None
            calibration_url = None
            processed_url = None

            # Step 8: Save to Database.
            print(f"DEBUG: About to check database saving - save_to_db={save_to_db}, user_id={user_id}")
            if save_to_db and user_id:
                print(f"DEBUG: Starting database save for image {image_id}")
                try:
                    # Get user location from the User table
                    try:
                        user = User.objects.get(id=user_id)
                        user_location = user.location_id if user.location else None
                        print(f"DEBUG: Found user {user_id} with location: {user_location}")
                    except User.DoesNotExist:
                        raise Exception(f"User with id {user_id} not found")
                    
                    # Save original image to Supabase storage
                    original_filename = f"uploads/{user_id}/{image_id}.{file_obj.name.split('.')[-1] if hasattr(file_obj, 'name') else 'jpg'}"
                    file_obj.seek(0)  # Reset file pointer
                    
                    print(f"DEBUG: Uploading to Supabase: {original_filename}")

                    # THIS
                    if system_settings['save_images']: 
                        supabase_upload = supabase.storage.from_("Beans").upload(original_filename, file_obj.read())
                        print(f"DEBUG: Supabase upload result: {supabase_upload}")
                    else:
                        print(f"DEBUG: Skipping Supabase upload as per system settings")

                    
                    # Create Image record with Supabase storage URL
                    print(f"DEBUG: Creating Image record")
                    image_record = ImageBucket.objects.create(
                        image_url=original_filename,
                        upload_date=timezone.now(),
                        location=Location.objects.get(id=user_location) if user_location else None
                    )
                    print(f"DEBUG: Created Image record with id: {image_record.id}")
                    
                    # Create UserImage relationship
                    print(f"DEBUG: Creating UserImage relationship")
                    UserImage.objects.create(
                        user_id=user_id,
                        image=image_record,
                        is_deleted=False
                    )
                    
                    # Save predictions and extracted features for each detected bean
                    print(f"DEBUG: Saving {len(all_beans)} beans")
                    for bean_index, bean in enumerate(all_beans):
                        # Generate random confidence for demo purposes
                        confidence = bean.get('confidence', random.uniform(0.5, 1.0))
                        
                        # Create Prediction record
                        prediction = Prediction.objects.create(
                            # Id here is auto-generated
                            image=image_record,
                            model_used="yolov11",
                            confidence_score=confidence,
                            predicted_label={
                                "bean_number": bean['bean_id'],
                                "bean_type": "Unlabeled",
                                "confidence": confidence
                            }
                        )
                        print(f"DEBUG: Created Prediction {prediction.id} for bean {bean['bean_id']}, confidence={confidence}")
                        
                        # Extract features for ExtractedFeature table
                        features = bean['features']
                        extracted_feature_record = ExtractedFeature.objects.create(
                            prediction=prediction,
                            # Converting to decimal
                            area=float(features.get('area_mm2', 0)),
                            perimeter=float(features.get('perimeter_mm', 0)),
                            major_axis_length=float(features.get('major_axis_length_mm', 0)),
                            minor_axis_length=float(features.get('minor_axis_length_mm', 0)),
                            extent=float(features.get('extent', 0)),
                            eccentricity=float(features.get('eccentricity', 0)),
                            convex_area=float(features.get('area_mm2', 0)),  # Using area as convex_area placeholder
                            solidity=float(features.get('solidity', 0)),
                            mean_intensity=float(features.get('mean_intensity', 0)),
                            equivalent_diameter=float(features.get('equivalent_diameter_mm', 0))
                        )

                        # Also save to BeanDetection for the new structure
                        BeanDetection.objects.create(
                            extracted_features=extracted_feature_record,
                            bean_id=bean['bean_id'],
                            length_mm=float(bean['length_mm']),
                            width_mm=float(bean['width_mm']),
                            bbox_x=int(bean['bbox'][0]),
                            bbox_y=int(bean['bbox'][1]),
                            bbox_width=int(bean['bbox'][2]),
                            bbox_height=int(bean['bbox'][3]),
                            comment=bean.get('comment', '')
                        )

                        # Also save in Annotation table
                        Annotation.objects.create(
                            image=image_record,
                            label={
                                "bean_number": bean['bean_id'],
                                "is_validated": False,
                                "validated_label": None,
                                "annotated_by": None
                            },
                            created_at=timezone.now()
                        )
                    
                    print(f"Successfully saved image {image_id} with {len(all_beans)} beans to database")
                    
                except Exception as e:
                    print(f"Failed to save to database: {str(e)}")
                    # Add error info to the result but don't fail the entire request
            else:
                print(f"DEBUG: Skipping database save - save_to_db={save_to_db}, user_id={user_id}")
                    
            # Step 7: Build response for this image
            image_result = {
                "image_id": image_id,
                "image_dimensions_mm": {
                    "width": w_mm,
                    "height": h_mm
                },
                "calibration": {
                    "mm_per_pixel": extractor.mm_per_px,
                    "marker_size_mm": extractor.marker_length
                },
                "beans": all_beans,
                "debug_images": {
                    "processed": processed_url,
                    "debug": debug_url,
                    "calibration": calibration_url
                },
                "total_beans_detected": len(all_beans),
                "saved_to_database": save_to_db and user_id is not None
            }
            
            # Add original image URL if saved to database and set all debug URLs to the same image
            if save_to_db and user_id:
                try:
                    original_filename = f"uploads/{user_id}/{image_id}.{file_obj.name.split('.')[-1] if hasattr(file_obj, 'name') else 'jpg'}"
                    public_url = supabase.storage.from_("Beans").get_public_url(original_filename)
                    image_result["original_image_url"] = public_url
                    
                    # Use the same Supabase image URL for all debug images
                    image_result["debug_images"] = {
                        "processed": public_url,
                        "debug": public_url,
                        "calibration": public_url
                    }
                except:
                    pass
            
            results.append(image_result)

            # # ACTIVITY LOG
            # if save_to_db and user_id:
            #     log_user_activity(
            #         user_id=user_id,
            #         action="UPLOAD",
            #         details=f"Processed image {image_id} with {len(all_beans)} beans detected",
            #         resource=original_filename.split("/")[-1] if 'original_filename' in locals() else f"{image_id}.jpg",
            #         status="success"
            #     ) 
            
        except Exception as e:
            results.append({
                "image_id": str(uuid.uuid4()),
                "error": f"Processing failed. Error: {str(e)}",
                "beans": []
            })
            # ACTIVITY LOG for failure

            log_user_activity(
                    user_id=user_id,
                    action="UPLOAD",
                    details=f"Failed to process image.",
                    resource=None,
                    status="failed"
                )
    
    # Step 9: Return segregated results
    return Response({
        "images": results,
        "total_images_processed": len(results),
        "total_beans_detected": sum(len(img.get("beans", [])) for img in results)
    })

# Keep the old single-image endpoint for backward compatibility
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def process_single_bean(request):
    try:
        file_obj = request.data['image']
    except KeyError:
        return Response({"error": "No image provided"}, status=400)
    user_id = request.data.get('user_id', None)

    # Convert uploaded image → OpenCV format
    img = Image.open(file_obj)
    img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    if extractor.extract_mm_per_px(img) is False:
        return Response({"error": "Calibration marker not found"}, status=400)
    
    img_debug, h, w = extractor.extract_mm_per_px(img)

    print(f"Image dimensions: {w}mm x{h}mm")

    # Run bean feature extraction
    black_bg, mask, gray, bean_bboxes = extractor.preprocess_image(img)
    features, bbox = extractor.extract_features(mask, gray)

    if features is None:
        return Response({"error": "No bean detected"}, status=400)

    # Draw bounding box
    debug_img = extractor.draw_bbox(img, bean_bboxes)

    # Encode to base64 for frontend
    _, buffer = cv2.imencode('.png', debug_img)
    filename = f"{uuid.uuid4()}.png"
    folder = os.path.join(settings.MEDIA_ROOT, "processed")
    os.makedirs(folder, exist_ok=True)  # ensure folder exists

    filepath = os.path.join(folder, filename)
    cv2.imwrite(filepath, debug_img)

    base_url = request.build_absolute_uri('/').rstrip('/')
    img_str = f"{base_url}{settings.MEDIA_URL}processed/{filename}"

    # Do the filepath saving to img_debug as well
    filepath2 = os.path.join(folder, f"debug_{filename}")
    cv2.imwrite(filepath2, img_debug)

    img_debug_str = f"{base_url}{settings.MEDIA_URL}processed/debug_{filename}"

    log_user_activity(
        user_id=user_id,
        action="UPLOAD",
        details=f"Uploaded and processed image.",
        resource=img_str,
        status="success"
    )

    return Response({
        "features": features,
        "processed_image": img_str,
        "image_debug" : img_debug_str
    })


@api_view(['GET'])
def test_database_connection(request):
    """
    Test endpoint to verify database connectivity and models
    """
    try:
        # Test User model
        user_count = User.objects.count()
        
        # Test Image model  
        image_count = ImageBucket.objects.count()
        
        # Test other models
        prediction_count = Prediction.objects.count()
        feature_count = ExtractedFeature.objects.count()
        bean_detection_count = BeanDetection.objects.count()
        
        return Response({
            "status": "Database connection successful",
            "counts": {
                "users": user_count,
                "images": image_count,
                "predictions": prediction_count,
                "extracted_features": feature_count,
                "bean_detections": bean_detection_count
            }
        })
        
    except Exception as e:
        return Response({
            "status": "Database connection failed",
            "error": str(e)
        }, status=500)


@api_view(['GET'])
def get_bean_detections(request, user_id):
    """
    Get all bean detection results for a user
    """
    try:
        # Get all bean detections for the user
        bean_detections = BeanDetection.objects.filter(
            extracted_features__prediction__image__userimage__user_id=user_id
        ).select_related('image').order_by('-created_at')
        
        # Group by image
        results = {}
        for detection in bean_detections:
            image_id = str(detection.image.id)
            if image_id not in results:
                results[image_id] = {
                    "image_id": image_id,
                    "image_url": detection.image.image_url,
                    "upload_date": detection.image.upload_date,
                    "beans": []
                }
            
            results[image_id]["beans"].append({
                "bean_id": detection.bean_id,
                "length_mm": float(detection.length_mm),
                "width_mm": float(detection.width_mm),
                "bbox": [detection.bbox_x, detection.bbox_y, 
                        detection.bbox_width, detection.bbox_height],
                "comment": detection.comment,
                "detection_date": detection.created_at
            })
        
        return Response({
            "images": list(results.values()),
            "total_images": len(results),
            "total_beans": len(bean_detections)
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)



@api_view(['GET'])
def get_annotations(request):
    """
    Get all images for researcher annotations - similar to get_all_beans but without filters
    Returns all images with their beans for annotation purposes
    """
    try:
        print("DEBUG: Starting optimized get_annotations view")
        
        # Get pagination parameters only
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 100))  # Higher default for annotations
        
        print(f"DEBUG: Parameters - page={page}, limit={limit}")
        
        # Calculate offset for pagination
        offset = (page - 1) * limit
        
        # Simple WHERE conditions - no filtering, just get all non-deleted images
        where_conditions = ["ui.is_deleted = false"]
        params = []
        
        where_clause = " AND ".join(where_conditions)
        
        # Step 1: Get all images with all related data in ONE query
        print("DEBUG: Executing main query with cursor for annotations")
        
        with connection.cursor() as cursor:
            # Main query that fetches everything we need in one go
            main_query = f"""
                SELECT DISTINCT
                    i.id as image_id,
                    i.image_url,
                    i.upload_date,
                    u.id as user_id,
                    u.first_name,
                    u.last_name,
                    r.name as role_name,
                    loc.id as location_id,
                    loc.name as location_name,
                    a.label->>'is_validated' as is_validated,
                    p.id as prediction_id,
                    p.predicted_label->>'bean_type' as bean_type,
                    p.predicted_label->>'confidence' as confidence,
                    ef.area,
                    ef.perimeter,
                    ef.major_axis_length,
                    ef.minor_axis_length,
                    ef.extent,
                    ef.eccentricity,
                    ef.convex_area,
                    ef.solidity,
                    ef.mean_intensity,
                    ef.equivalent_diameter,
                    ef.id as extracted_feature_id
                FROM images i
                INNER JOIN user_images ui ON i.id = ui.image_id
                INNER JOIN users u ON ui.user_id = u.id
                INNER JOIN user_roles ur ON u.id = ur.user_id
                INNER JOIN roles r ON ur.role_id = r.id
                LEFT JOIN locations loc ON u.location_id = loc.id
                LEFT JOIN annotations a ON i.id = a.image_id
                LEFT JOIN predictions p ON i.id = p.image_id
                LEFT JOIN extracted_features ef ON p.id = ef.prediction_id
                WHERE {where_clause}
                ORDER BY i.upload_date DESC
            """
            
            print(f"DEBUG: Executing query: {main_query}")
            print(f"DEBUG: With params: {params}")
            
            cursor.execute(main_query, params)
            all_rows = cursor.fetchall()
            
            print(f"DEBUG: Fetched {len(all_rows)} total rows from main query")

            # Also get bean detection data separately for better organization
            if all_rows:
                image_ids = list(set(row[0] for row in all_rows))  # Get unique image IDs
                
                bean_query = f"""
                    SELECT 
                        p.image_id,
                        bd.bean_id,
                        bd.length_mm,
                        bd.width_mm,
                        bd.bbox_x,
                        bd.bbox_y,
                        bd.bbox_width,
                        bd.bbox_height,
                        bd.comment,
                        bd.created_at,
                        ef.id as extracted_feature_id,
                        p.id as prediction_id
                    FROM bean_detections bd
                    JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                    JOIN predictions p ON ef.prediction_id = p.id
                    WHERE p.image_id = ANY(%s)
                    ORDER BY p.image_id, bd.bean_id
                """
                
                cursor.execute(bean_query, [image_ids])
                bean_rows = cursor.fetchall()
                
                print(f"DEBUG: Fetched {len(bean_rows)} bean detection rows")
            else:
                bean_rows = []
        
        # Step 3: Process data in memory (NO database queries in this section)
        print("DEBUG: Processing data in memory for annotations")
        
        # Group main data by image_id
        images_data = {}
        for row in all_rows:
            image_id = row[0]
            if image_id not in images_data:
                images_data[image_id] = {
                    'image_id': row[0],
                    'image_url': row[1],
                    'upload_date': row[2],
                    'user_id': row[3],
                    'first_name': row[4],
                    'last_name': row[5],
                    'role_name': row[6],
                    'location_id': row[7],
                    'location_name': row[8],
                    'is_validated': row[9],  # Already extracted from JSON
                    'prediction_id': row[10],
                    'bean_type': row[11],  # Already extracted from JSON
                    'confidence': row[12],  # Already extracted from JSON
                    'extracted_features': {
                        'area': row[13],
                        'perimeter': row[14],
                        'major_axis_length': row[15],
                        'minor_axis_length': row[16],
                        'extent': row[17],
                        'eccentricity': row[18],
                        'convex_area': row[19],
                        'solidity': row[20],
                        'mean_intensity': row[21],
                        'equivalent_diameter': row[22],
                        'extracted_feature_id': row[23]
                    } if row[13] is not None else None
                }
        
        print(f"DEBUG: Processed {len(images_data)} unique images from main query")
    
        # Group bean detections by image_id
        beans_by_image = {}
        for bean_row in bean_rows:
            image_id = bean_row[0]
            if image_id not in beans_by_image:
                beans_by_image[image_id] = []
            
            beans_by_image[image_id].append({
                'bean_id': bean_row[1],
                'length_mm': float(bean_row[2]),
                'width_mm': float(bean_row[3]),
                'bbox_x': bean_row[4],
                'bbox_y': bean_row[5],
                'bbox_width': bean_row[6],
                'bbox_height': bean_row[7],
                'comment': bean_row[8] or "",
                'created_at': bean_row[9],
                'extracted_feature_id': bean_row[10]
            })
        
        # Apply pagination
        total_count = len(images_data)
        images_list = list(images_data.values())
        paginated_images = images_list[offset:offset + limit]
        
        print(f"DEBUG: Pagination - total_count={total_count}, showing {len(paginated_images)} images")
        
        # Step 4: Build response data (NO database queries)
        data = []
        print("DEBUG: Building response data from in-memory data for annotations")
        
        # Create extracted features lookup for efficient access
        extracted_features_data = {}
        for row in all_rows:
            if row[23] is not None:  # extracted_feature_id
                extracted_features_data[row[23]] = {
                    'area': row[13],
                    'perimeter': row[14],
                    'major_axis_length': row[15],
                    'minor_axis_length': row[16],
                    'extent': row[17],
                    'eccentricity': row[18],
                    'convex_area': row[19],
                    'solidity': row[20],
                    'mean_intensity': row[21],
                    'equivalent_diameter': row[22],
                }
        
        for img_data in images_data.values():
            try:
                image_id = img_data['image_id']
                
                # Generate public URL for image
                try:
                    publicUrl = supabase.storage.from_("Beans").get_public_url(
                        img_data['image_url']
                    )
                except Exception as e:
                    print(f"DEBUG: Error generating public URL for image {image_id}: {str(e)}")
                    publicUrl = ""
                
                # Get validation status from pre-extracted data
                is_validated_str = img_data['is_validated']
                is_validated = is_validated_str == 'true' if is_validated_str else False
                
                # Get bean detections from pre-fetched data
                bean_detections = beans_by_image.get(image_id, [])
                predictions = []
                
                # Process predictions using pre-extracted data
                bean_type = img_data['bean_type'] or "Unknown"
                confidence = float(img_data['confidence']) if img_data['confidence'] else 0.0

                for detection in bean_detections:
                    features = extracted_features_data.get(detection['extracted_feature_id'], {})
                    
                    predictions.append({
                        "bean_id": detection['bean_id'],
                        "is_validated": is_validated,
                        "bean_type": bean_type,
                        "confidence": confidence,
                        "length_mm": detection['length_mm'],
                        "width_mm": detection['width_mm'],
                        "bbox": [detection['bbox_x'], detection['bbox_y'], 
                                detection['bbox_width'], detection['bbox_height']],
                        "comment": detection['comment'],
                        "detection_date": detection['created_at'].isoformat() if hasattr(detection['created_at'], 'isoformat') else str(detection['created_at']),
                        "features": {
                            "area": float(features.get('area')) if features.get('area') else None,
                            "perimeter": float(features.get('perimeter')) if features.get('perimeter') else None,
                            "major_axis_length": float(features.get('major_axis_length')) if features.get('major_axis_length') else None,
                            "minor_axis_length": float(features.get('minor_axis_length')) if features.get('minor_axis_length') else None,
                            "extent": float(features.get('extent')) if features.get('extent') else None,
                            "eccentricity": float(features.get('eccentricity')) if features.get('eccentricity') else None,
                            "convex_area": float(features.get('convex_area')) if features.get('convex_area') else None,
                            "solidity": float(features.get('solidity')) if features.get('solidity') else None,
                            "mean_intensity": float(features.get('mean_intensity')) if features.get('mean_intensity') else None,
                            "equivalent_diameter": float(features.get('equivalent_diameter')) if features.get('equivalent_diameter') else None
                        },
                        "extracted_feature_id": detection['extracted_feature_id']
                    })
                
                # Format user name
                user_name = f"{img_data['first_name']} {img_data['last_name']}" if img_data['first_name'] and img_data['last_name'] else "Unknown User"
                
                # Calculate validation statistics
                validated_beans = sum(1 for pred in predictions if pred['is_validated'] is True)
                total_beans = len(predictions)
                validation_progress = (validated_beans / total_beans * 100) if total_beans > 0 else 0
                
                # Build the response item
                response_item = {
                    "id": str(img_data['image_id']),
                    "src": publicUrl,
                    "userName": user_name,
                    "userRole": img_data['role_name'] or "unknown",
                    "location": img_data['location_name'] or "",
                    "submissionDate": img_data['upload_date'].strftime('%Y-%m-%d') if img_data['upload_date'] else "",
                    "upload_date": img_data['upload_date'].isoformat() if img_data['upload_date'] else None,
                    "predictions": predictions,
                    "totalBeans": total_beans,
                    "validatedBeans": validated_beans,
                    "validationProgress": round(validation_progress, 1),
                    "is_fully_validated": total_beans > 0 and validated_beans == total_beans,
                    # Additional fields for compatibility
                    "userId": str(img_data['user_id']),
                    "locationId": str(img_data['location_id']) if img_data['location_id'] else None,
                    "locationName": img_data['location_name'],
                    "is_validated": total_beans > 0 and validated_beans == total_beans,
                    "allegedVariety": None
                }
                
                data.append(response_item)
                
            except Exception as e:
                print(f"DEBUG: Error processing image {img_data.get('image_id', 'unknown')}: {str(e)}")
                continue
        
        print(f"DEBUG: Finished processing. Built response with {len(data)} images")
        
        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit
        
        return Response({
            "images": data,
            "pagination": {
                "currentPage": page,
                "totalPages": total_pages,
                "totalItems": total_count,
                "itemsPerPage": limit
            }
        })

    except Exception as e:
        print(f"DEBUG: MAIN ERROR in get_annotations: {str(e)}")
        import traceback
        print(f"DEBUG: FULL TRACEBACK: {traceback.format_exc()}")
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
def get_all_beans(request):
    try:
        print("DEBUG: Starting optimized get_all_beans view with search and Django pagination")
        
        # Get URL parameters
        status = request.GET.get('status')  # 'verified', 'pending', or None for all
        farm = request.GET.get('farm')
        role = request.GET.get('role')
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        
        # Get search parameters
        search_owner = request.GET.get('search_owner', '').strip()
        search_image_id = request.GET.get('search_image_id', '').strip()
        
        print(f"DEBUG: Parameters - status={status}, farm={farm}, role={role}, page={page}, limit={limit}")
        print(f"DEBUG: Search parameters - owner={search_owner}, image_id={search_image_id}")
        
        # Calculate offset for pagination
        offset = (page - 1) * limit
        
        # Build dynamic WHERE conditions
        where_conditions = ["ui.is_deleted = false"]
        params = []
        
        if role:
            where_conditions.append("r.name = %s")
            params.append(role)
            
        if farm:
            where_conditions.append("loc.name ILIKE %s")
            params.append(f"%{farm}%")
            
        # Add search conditions
        if search_owner:
            where_conditions.append("(u.first_name ILIKE %s OR u.last_name ILIKE %s OR CONCAT(u.first_name, ' ', u.last_name) ILIKE %s)")
            search_pattern = f"%{search_owner}%"
            params.extend([search_pattern, search_pattern, search_pattern])
            
        if search_image_id:
            where_conditions.append("CAST(i.id AS TEXT) ILIKE %s")
            params.append(f"%{search_image_id}%")
        
        where_clause = " AND ".join(where_conditions)
        
        # Step 1: Get total count and filtered images with all related data in ONE query
        print("DEBUG: Executing main query with cursor for maximum performance")
        
        with connection.cursor() as cursor:
            # Main query that fetches everything we need in one go
            main_query = f"""
                SELECT DISTINCT
                    i.id as image_id,
                    i.image_url,
                    i.upload_date,
                    u.id as user_id,
                    u.first_name,
                    u.last_name,
                    r.name as role_name,
                    loc.id as location_id,
                    loc.name as location_name,
                    a.label->>'is_validated' as is_validated,
                    p.id as prediction_id,
                    p.predicted_label->>'bean_type' as bean_type,
                    p.predicted_label->>'confidence' as confidence,
                    ef.area,
                    ef.perimeter,
                    ef.major_axis_length,
                    ef.minor_axis_length,
                    ef.extent,
                    ef.eccentricity,
                    ef.convex_area,
                    ef.solidity,
                    ef.mean_intensity,
                    ef.equivalent_diameter,
                    ef.id as extracted_feature_id
                FROM images i
                INNER JOIN user_images ui ON i.id = ui.image_id
                INNER JOIN users u ON ui.user_id = u.id
                INNER JOIN user_roles ur ON u.id = ur.user_id
                INNER JOIN roles r ON ur.role_id = r.id
                INNER JOIN locations loc ON u.location_id = loc.id
                LEFT JOIN annotations a ON i.id = a.image_id
                LEFT JOIN predictions p ON i.id = p.image_id
                LEFT JOIN extracted_features ef ON p.id = ef.prediction_id
                WHERE {where_clause}
                ORDER BY i.upload_date DESC
            """
            
            cursor.execute(main_query, params)
            all_rows = cursor.fetchall()
            
            print(f"DEBUG: Fetched {len(all_rows)} rows from main query")
            
            # Step 2: Get bean detections for all images in one query
            if all_rows:
                image_ids = list(set(row[0] for row in all_rows))  # Get unique image IDs
                
                bean_query = """
                    SELECT 
                        p.image_id,
                        bd.bean_id,
                        bd.length_mm,
                        bd.width_mm,
                        bd.bbox_x,
                        bd.bbox_y,
                        bd.bbox_width,
                        bd.bbox_height,
                        bd.comment,
                        bd.created_at,
                        ef.id as extracted_feature_id,
                        p.id as prediction_id
                    FROM bean_detections bd
                    JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                    JOIN predictions p ON ef.prediction_id = p.id
                    WHERE p.image_id = ANY(%s)
                    ORDER BY p.image_id, bd.bean_id
                """
                
                cursor.execute(bean_query, [image_ids])
                bean_rows = cursor.fetchall()
                
                print(f"DEBUG: Fetched {len(bean_rows)} bean detection rows")
            else:
                bean_rows = []
        
        # Step 3: Process data in memory (NO database queries in this section)

        
        # Group main data by image_id
        images_data = {}
        for row in all_rows:
            image_id = row[0]
            if image_id not in images_data:
                images_data[image_id] = {
                    'image_id': row[0],
                    'image_url': row[1],
                    'upload_date': row[2],
                    'user_id': row[3],
                    'first_name': row[4],
                    'last_name': row[5],
                    'role_name': row[6],
                    'location_id': row[7],
                    'location_name': row[8],
                    'is_validated': row[9],  # Already extracted from JSON
                    'prediction_id': row[10],
                    'bean_type': row[11],  # Already extracted from JSON
                    'confidence': row[12],  # Already extracted from JSON
                    'extracted_features': {
                        'area': row[13],
                        'perimeter': row[14],
                        'major_axis_length': row[15],
                        'minor_axis_length': row[16],
                        'extent': row[17],
                        'eccentricity': row[18],
                        'convex_area': row[19],
                        'solidity': row[20],
                        'mean_intensity': row[21],
                        'equivalent_diameter': row[22],
                        'extracted_feature_id': row[23]
                    } if row[13] is not None else None
            }
        print(f"DEBUG: Processed {len(images_data)} uique images from main query")

    
        # Group bean detections by image_id
        beans_by_image = {}
        for bean_row in bean_rows:
            image_id = bean_row[0]
            if image_id not in beans_by_image:
                beans_by_image[image_id] = []
            
            beans_by_image[image_id].append({
                'bean_id': bean_row[1],
                'length_mm': float(bean_row[2]),
                'width_mm': float(bean_row[3]),
                'bbox_x': bean_row[4],
                'bbox_y': bean_row[5],
                'bbox_width': bean_row[6],
                'bbox_height': bean_row[7],
                'comment': bean_row[8] or "",
                'created_at': bean_row[9],
                'extracted_feature_id': bean_row[10]
            })
        
        # Filter by status if needed
        if status:
            print(f"DEBUG: Filtering by status: {status}")
            filtered_images_data = {}
            for image_id, img_data in images_data.items():
                # Use pre-extracted is_validated value from database
                is_validated_str = img_data['is_validated']
                is_validated = is_validated_str == 'true' if is_validated_str else False
                
                if status == 'verified' and is_validated:
                    filtered_images_data[image_id] = img_data
                elif status == 'pending' and not is_validated:
                    filtered_images_data[image_id] = img_data
                elif status == 'pending' and is_validated_str is None:
                    # If no annotation, consider it pending
                    filtered_images_data[image_id] = img_data
            
            images_data = filtered_images_data
            print(f"DEBUG: After status filtering, {len(images_data)} images remain")
        
        # Use Django Paginator for pagination
        images_list = list(images_data.values())
        paginator = Paginator(images_list, limit)
        
        try:
            paginated_images = paginator.page(page)
        except Exception as e:
            print(f"DEBUG: Pagination error: {str(e)}")
            # If page is out of range, return the last page
            paginated_images = paginator.page(paginator.num_pages)
        
        print(f"DEBUG: Django Pagination - total_count={paginator.count}, showing page {paginated_images.number} of {paginator.num_pages}")
        
        
        # Step 4: Build response data (NO database queries)
        data = []
        print("DEBUG: Building response data from in-memory data")
        
        for i, img_data in enumerate(paginated_images):
            try:
                image_id = img_data['image_id']
                
                # Generate signed URL for image
                try:
                    public_url_res = supabase.storage.from_("Beans").get_public_url(
                        img_data['image_url']
                    )
                except Exception as e:
                    print(f"DEBUG: Error generating public URL for image {i+1}: {str(e)}")
                    public_url_res = {"publicURL": ""}
                
                # Get validation status from pre-extracted data
                is_validated_str = img_data['is_validated']
                is_validated = is_validated_str == 'true' if is_validated_str else False
                
                # Get bean detections from pre-fetched data
                bean_detections = beans_by_image.get(image_id, [])
                predictions = []
                
                # Process predictions using pre-extracted data
                bean_type = img_data['bean_type'] or "Unknown"
                
                extracted_features_data = {}
                for row in all_rows:
                    extracted_features_data[row[23]] = { # per ef id
                        'area': row[13],
                        'perimeter': row[14],
                        'major_axis_length': row[15],
                        'minor_axis_length': row[16],
                        'extent': row[17],
                        'eccentricity': row[18],
                        'convex_area': row[19],
                        'solidity': row[20],
                        'mean_intensity': row[21],
                        'equivalent_diameter': row[22],
                        'extracted_feature_id': row[23],
                        'confidence': row[12],
                    }

                for detection in bean_detections:
                    if extracted_features_data[detection['extracted_feature_id']]['confidence']:
                        confidence = float(extracted_features_data[detection['extracted_feature_id']]['confidence'])
                    else:
                        confidence = 0.8
                    # print confidence if it is None or other non-float
                    print(f"DEBUG: Bean detection {detection['bean_id']} confidence: {confidence}")
                    predictions.append({
                        "bean_id": detection['bean_id'],
                        "is_validated": is_validated,
                        "bean_type": bean_type,
                        "confidence": confidence if confidence is None or isinstance(confidence, float) else 0.8,
                        "length_mm": detection['length_mm'],
                        "width_mm": detection['width_mm'],
                        "bbox": [detection['bbox_x'], detection['bbox_y'], 
                                detection['bbox_width'], detection['bbox_height']],
                        "comment": detection['comment'],
                        "detection_date": detection['created_at'].isoformat() if hasattr(detection['created_at'], 'isoformat') else str(detection['created_at']),
                        "features":{
                            "area_mm2": float(extracted_features_data[detection['extracted_feature_id']]['area']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "perimeter_mm": float(extracted_features_data[detection['extracted_feature_id']]['perimeter']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "major_axis_length_mm": float(extracted_features_data[detection['extracted_feature_id']]['major_axis_length']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "minor_axis_length_mm": float(extracted_features_data[detection['extracted_feature_id']]['minor_axis_length']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "extent": float(extracted_features_data[detection['extracted_feature_id']]['extent']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "eccentricity": float(extracted_features_data[detection['extracted_feature_id']]['eccentricity']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "convex_area": float(extracted_features_data[detection['extracted_feature_id']]['convex_area']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "solidity": float(extracted_features_data[detection['extracted_feature_id']]['solidity']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "mean_intensity": float(extracted_features_data[detection['extracted_feature_id']]['mean_intensity']) if extracted_features_data[detection['extracted_feature_id']] else None,
                            "equivalent_diameter_mm": float(extracted_features_data[detection['extracted_feature_id']]['equivalent_diameter']) if extracted_features_data[detection['extracted_feature_id']] else None
                        },
                        "extracted_feature_id": detection['extracted_feature_id']

                    })
                
                # Process legacy predictions from pre-fetched data
                extracted_features = None
                legacy_prediction = None
                
                if img_data['extracted_features'] and img_data['extracted_features']['area'] is not None:
                    ef = img_data['extracted_features']
                    legacy_prediction = bean_type  # Use pre-extracted bean_type
                    
                    extracted_features = {
                        "area": float(ef['area']),
                        "perimeter": float(ef['perimeter']),
                        "major_axis_length": float(ef['major_axis_length']),
                        "minor_axis_length": float(ef['minor_axis_length']),
                        "extent": float(ef['extent']),
                        "eccentricity": float(ef['eccentricity']),
                        "convex_area": float(ef['convex_area']),
                        "solidity": float(ef['solidity']),
                        "mean_intensity": float(ef['mean_intensity']),
                        "equivalent_diameter": float(ef['equivalent_diameter']),
                        "bean_type": legacy_prediction
                    }
                
                # Build image data
                image_data = {
                    "id": str(img_data['image_id']),
                    "src": public_url_res,
                    "userId": str(img_data['user_id']),
                    "userName": f"{img_data['first_name']} {img_data['last_name']}",
                    "userRole": img_data['role_name'] or "unknown",
                    "locationId": str(img_data['location_id']) if img_data['location_id'] else None,
                    "locationName": img_data['location_name'],
                    "submissionDate": img_data['upload_date'].isoformat() if hasattr(img_data['upload_date'], 'isoformat') else str(img_data['upload_date']),
                    "is_validated": is_validated,
                    "allegedVariety": None,
                }
                
                # Add predictions in the appropriate format
                if predictions:
                    # New multi-bean format
                    image_data["predictions"] = predictions
                elif extracted_features:
                    # Legacy single-bean format
                    image_data["bean_type"] = legacy_prediction
                    image_data["predictions"] = extracted_features
                else:
                    # No predictions found
                    image_data["predictions"] = []
                
                data.append(image_data)
                
            except Exception as e:
                print(f"DEBUG: Error processing image {i+1}: {str(e)}")
                continue
        
        print(f"DEBUG: Finished processing. Built response with {len(data)} images")
        
        # Use Django pagination info
        return Response({
            "images": data,
            "pagination": {
                "currentPage": paginated_images.number,
                "totalPages": paginator.num_pages,
                "totalItems": paginator.count,
                "itemsPerPage": limit,
                "hasNext": paginated_images.has_next(),
                "hasPrevious": paginated_images.has_previous()
            }
        })

    except Exception as e:
        print(f"DEBUG: MAIN ERROR in get_all_beans: {str(e)}")
        import traceback
        print(f"DEBUG: FULL TRACEBACK: {traceback.format_exc()}")
        return Response({"error": str(e)}, status=500)
    
@api_view(['POST'])
def validate_beans(request):
    """
     bean_id: selectedBeanId,
        bean_type: editingBean.bean_type,
        features: editingBean.features,
        is_validated: true,
        annotated_by: {id, name, role}

        will return response ok
    """
    
    data = request.data
    image_id = data.get('image_id')
    bean_id = data.get('bean_id')
    bean_type = data.get('bean_type')
    extracted_feature_id = data.get('extracted_feature_id')
    features = data.get('features', {})
    confidence = data.get('confidence', None)
    is_validated = data.get('is_validated', False)
    annotated_by = data.get('annotated_by', {})  # New field for annotator information

    #print features and confidence
    print(f"DEBUG: validate_beans called with image_id={image_id}, bean_id={bean_id}, bean_type={bean_type}, extracted_feature_id={extracted_feature_id}, features={features}, confidence={confidence}, is_validated={is_validated}, annotated_by={annotated_by}")
    if not bean_id or not bean_type or not features:
        return Response({"error": "bean_id, bean_type, and features are required"}, status=400)
    
    # Get annotator information if provided
    annotator_info = None
    if annotated_by and annotated_by.get('id'):
        try:
            user = User.objects.select_related().get(id=annotated_by['id'])
            user_role = UserRole.objects.select_related('role').filter(user=user).first()
            
            annotator_info = {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.username,
                "role": user_role.role.name if user_role else "unknown"
            }
            print(f"DEBUG: Annotator info: {annotator_info}")
        except User.DoesNotExist:
            print(f"DEBUG: User with id {annotated_by['id']} not found")
            annotator_info = annotated_by  # Use provided info as fallback
    elif annotated_by:
        # Use provided annotated_by info directly
        annotator_info = annotated_by
    
    annotations_id = Annotation.objects.filter(image_id=image_id).extra(
        where=["label->>'bean_number' = %s"],
        params=[str(bean_id)]
    ).values('id').first()
    print(annotations_id)
    predictions_id = Prediction.objects.filter(image_id=image_id, extractedfeature__id=extracted_feature_id).values('id').first()
    # predictions_table = Prediction.objects.filter(image_id=image_id, extractedfeature=ExtractedFeature()).values('id')
    print(f"DEBUG: Found annotations_id: {annotations_id}, predictions_id: {predictions_id}")
    try:
        #Update extracted features
        if extracted_feature_id:
            ExtractedFeature.objects.filter(id=extracted_feature_id).update(
                area=features.get('area', features.get('area_mm2', 0)),
                perimeter=features.get('perimeter', features.get('perimeter_mm', 0)),
                major_axis_length=features.get('major_axis_length', features.get('major_axis_length_mm', 0)),
                minor_axis_length=features.get('minor_axis_length', features.get('minor_axis_length_mm', 0)),
                extent=features.get('extent', 0),
                eccentricity=features.get('eccentricity', 0),
                convex_area=features.get('convex_area', 0),
                solidity=features.get('solidity', 0),
                mean_intensity=features.get('mean_intensity', 0),
                equivalent_diameter=features.get('equivalent_diameter', features.get('equivalent_diameter_mm', 0))
            )
            print(f"DEBUG: Updated ExtractedFeature {extracted_feature_id}")
        if predictions_id:
            # Update prediction with annotator information
            prediction_update_data = {
                "predicted_label": {
                    "bean_number": bean_id,
                    "bean_type": bean_type,
                    "confidence": confidence
                }
            }
            
            # Add annotated_by information if available
            if annotator_info:
                prediction_update_data["predicted_label"]["annotated_by"] = annotator_info
                
            Prediction.objects.filter(id=predictions_id['id']).update(**prediction_update_data)
            print(f"DEBUG: Updated Prediction {predictions_id['id']} with annotator info")
        if annotations_id:
            # Update annotation with annotator information
            annotation_label = {
                "bean_number": bean_id,
                "is_validated": is_validated,
                "validated_label": bean_type,
            }
            
            # Add annotated_by information if available
            if annotator_info:
                annotation_label["annotated_by"] = annotator_info
            else:
                annotation_label["annotated_by"] = "admin"  # Default fallback
            
            Annotation.objects.filter(id=annotations_id['id']).update(
                label=annotation_label,
                created_at=timezone.now()
            )
            print(f"DEBUG: Updated Annotation {annotations_id['id']} with annotator info")
            
        # Activity Log here
        activity_description = f"Bean ID {bean_id} in Image ID {image_id} validated as '{bean_type}'"
        if annotator_info:
            activity_description += f" by {annotator_info['name']} ({annotator_info['role']})"
        
        # Safely get user_id for logging
        log_user_id = None
        if annotator_info and annotator_info.get('id'):
            log_user_id = annotator_info['id']
        
        # LOG UPDATE VALIDATION ACTIVITY
        log_user_activity(
            user_id=log_user_id,
            action="UPDATE",
            details=activity_description,
            resource=ImageBucket.objects.filter(id=image_id).first().image_url.split("/")[-1] if ImageBucket.objects.filter(id=image_id).exists() else None,
            status="success"
        )

        print(f"DEBUG: Created activity log entry")
        # Return response true
        return Response({
            "status": "success", 
            "message": "Bean validation updated successfully",
            "annotated_by": annotator_info
        }, status=200)
        
    except Exception as e:
        # LOG UPDATE VALIDATION ACTIVITY
        log_user_activity(
            user_id=annotator_info.get('id') if annotator_info else None,
            action="UPDATE",
            details=f"Failed to validate Bean ID {bean_id} in Image ID {image_id}: {str(e)}",
            resource=ImageBucket.objects.filter(id=image_id).first().image_url.split("/")[-1] if ImageBucket.objects.filter(id=image_id).exists() else None,
            status="failed"
        )
        return Response({"error": str(e)}, status=500)
    

@api_view(['DELETE'])
def delete_bean(request,image_id):
    
    print(f"DEBUG: Starting delete_bean for image_id={image_id}")
    
    with transaction.atomic():
       # Start finding the image
        image = ImageBucket.objects.filter(id=image_id).first()
        if not image:
              print(f"DEBUG: Image with id {image_id} not found")
              return Response({"error": "Image not found"}, status=404)
        print(f"DEBUG: Found image: {image.id}, URL: {image.image_url}")

        # Delete the Image in the Supabase Storage First
           # First find the img url e.g. upload/userid/imgname
        image_path = image.image_url
        print(f"DEBUG: Image path to delete from Supabase: {image_path}")
        delete_image = supabase.storage.from_("Beans").remove([image_path])
        
        print(f"DEBUG: Successfully deleted image from Supabase storage")
        
        print(f"DEBUG: Supabase delete response: {delete_image}")
        # Delete Image as it is cascade delete
        image.delete()
        print(f"DEBUG: Successfully deleted image record from database")

        # Log deletion activity
        if image:
            log_user_activity(
                user_id=request.user.id if request.user and request.user.is_authenticated else None,
                action="DELETE",
                details=f"Deleted Image ID {image_id}",
                resource=ImageBucket.objects.filter(id=image_id).first().image_url.split("/")[-1] if ImageBucket.objects.filter(id=image_id).exists() else None,
                status="success"
            )
        else:
            log_user_activity(
                user_id=request.user.id if request.user and request.user.is_authenticated else None,
                action="DELETE",
                details=f"Failed to delete Image ID {image_id} - not found after deletion attempt",
                resource=None,
                status="failed"
        )
        print(f"DEBUG: Created activity log entry for deletion")
    return Response({"status": "success"}, status=200)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_images(request):
    """
    Handle ZIP file upload and extract images to Supabase bucket Beans/uploads/
    """
    try:
        print("DEBUG: Starting upload_images view")
        
        return Response({
            "status": "success"
        }, status=201)
        
    except Exception as e:
        print(f"DEBUG: Error in upload_images: {str(e)}")
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        return Response({"error": f"Upload failed: {str(e)}"}, status=500)


@api_view(['POST'])
def upload_records(request):
    """
    Handle CSV data (already converted to JSON in frontend) and save to database
    Expected format matches the structure from get_all_beans function
    """
    try:
        print("DEBUG: Starting upload_records view")
        
        # Get JSON data from request
        records_data = request.data.get('records')
        if not records_data:
            return Response({"error": "No records data provided"}, status=400)
        
        # Get optional user_id for activity logging
        user_id = request.data.get('user_id')
        
        print(f"DEBUG: Processing {len(records_data)} records")
        
        created_records = []
        errors = []
        
        with transaction.atomic():
            for record_index, record in enumerate(records_data):
                try:
                    print(f"DEBUG: Processing record {record_index + 1}")
                    
                    # Extract required fields
                    user_id_record = record.get('userId')
                    image_url = record.get('image_url')
                    location_name = record.get('locationName')
                    bean_type = record.get('bean_type', 'Unknown')
                    is_validated = record.get('is_validated', False)
                    
                    # Extract morphological features (nested structure)
                    features_data = record.get('features', {})
                    if not features_data:
                        # Try to get from prediction.features if nested
                        prediction_data = record.get('prediction', {})
                        features_data = prediction_data.get('features', {})
                    
                    # Validate required fields
                    if not user_id_record:
                        errors.append(f"Record {record_index + 1}: Missing user_id")
                        continue
                    
                    if not image_url:
                        errors.append(f"Record {record_index + 1}: Missing image_url")
                        continue
                    
                    # Get or create user (basic validation)
                    try:
                        user = User.objects.get(id=user_id_record)
                    except User.DoesNotExist:
                        errors.append(f"Record {record_index + 1}: User with ID {user_id_record} not found")
                        continue
                    
                    # Get or create location
                    location = None
                    if location_name:
                        location, created = Location.objects.get_or_create(
                            name=location_name,
                            defaults={'description': f'Auto-created from upload: {location_name}'}
                        )
                    
                    # Create Image record
                    image = ImageBucket.objects.create(
                        image_url=image_url,
                        upload_date=timezone.now()
                    )
                    
                    # Create UserImage relationship
                    user_image = UserImage.objects.create(
                        user=user,
                        image=image,
                        is_deleted=False
                    )
                    
                    # Create Prediction record
                    prediction = Prediction.objects.create(
                        image=image,
                        predicted_label={
                            'bean_type': bean_type,
                            'confidence': record.get('confidence', 0.8)
                        },
                        confidence=record.get('confidence', 0.8)
                    )
                    
                    # Create ExtractedFeature record if features are provided
                    extracted_feature = None
                    if features_data:
                        extracted_feature = ExtractedFeature.objects.create(
                            prediction=prediction,
                            area=features_data.get('area_mm2', 0.0),
                            perimeter=features_data.get('perimeter_mm', 0.0),
                            major_axis_length=features_data.get('major_axis_length_mm', 0.0),
                            minor_axis_length=features_data.get('minor_axis_length_mm', 0.0),
                            extent=features_data.get('extent', 0.0),
                            eccentricity=features_data.get('eccentricity', 0.0),
                            convex_area=features_data.get('convex_area', 0.0),
                            solidity=features_data.get('solidity', 0.0),
                            mean_intensity=features_data.get('mean_intensity', 0.0),
                            equivalent_diameter=features_data.get('equivalent_diameter_mm', 0.0)
                        )
                    
                    # Create BeanDetection record if bean detection data is provided
                    bean_detection_data = record.get('bean_detection', {})
                    if bean_detection_data or extracted_feature:
                        bbox = bean_detection_data.get('bbox', [0, 0, 0, 0])
                        
                        bean_detection = BeanDetection.objects.create(
                            extracted_features=extracted_feature,
                            bean_id=bean_detection_data.get('bean_id', 1),
                            length_mm=bean_detection_data.get('length_mm', 0.0),
                            width_mm=bean_detection_data.get('width_mm', 0.0),
                            bbox_x=bbox[0] if len(bbox) >= 1 else 0,
                            bbox_y=bbox[1] if len(bbox) >= 2 else 0,
                            bbox_width=bbox[2] if len(bbox) >= 3 else 0,
                            bbox_height=bbox[3] if len(bbox) >= 4 else 0,
                            comment=bean_detection_data.get('comment', ''),
                            created_at=timezone.now()
                        )
                    
                    # Create Annotation record if validation data is provided
                    if is_validated:
                        annotation = Annotation.objects.create(
                            image=image,
                            label={
                                'bean_type': bean_type,
                                'is_validated': True,
                                'bean_number': bean_detection_data.get('bean_id', 1)
                            },
                            annotated_at=timezone.now()
                        )
                    
                    created_records.append({
                        'image_id': image.id,
                        'user_id': user.id,
                        'bean_type': bean_type,
                        'is_validated': is_validated
                    })
                    
                    print(f"DEBUG: Successfully created record {record_index + 1}")
                    
                except Exception as e:
                    error_msg = f"Record {record_index + 1}: {str(e)}"
                    errors.append(error_msg)
                    print(f"DEBUG: Error processing record {record_index + 1}: {str(e)}")
                    continue
        
        # Log activity
        if created_records:
            log_user_activity(
                user_id=user_id,
                action="UPLOAD",
                details=f"Uploaded {len(created_records)} records via CSV import",
                resource="CSV upload",
                status="success" if not errors else "partial"
            )
        
        # Prepare response
        response_data = {
            "message": f"Processing completed",
            "created_count": len(created_records),
            "error_count": len(errors),
            "created_records": created_records
        }
        
        if errors:
            response_data["errors"] = errors
            return Response(response_data, status=206)  # Partial success
        else:
            return Response(response_data, status=201)  # Full success
            
    except Exception as e:
        print(f"DEBUG: Error in upload_records: {str(e)}")
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        return Response({"error": f"Upload failed: {str(e)}"}, status=500)
    
@api_view(['GET'])
def get_max_upload_images(request):
    """
    Return the maximum number of images allowed per upload from system settings
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT image_accepted_count FROM plans")
            row = cursor.fetchone()
            if not row:
                return Response({"error": "System settings not found"}, status=500)

            max_images = row[0]  # Assuming the count is stored in the first column

        
        print(f"DEBUG: Max upload images limit: {max_images}")
        
        return Response({
            "max_upload_images": max_images
        }, status=200)
        
    except Exception as e:
        print(f"DEBUG: Error in get_max_upload_images: {str(e)}")
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        return Response({"error": f"Failed to retrieve max upload images: {str(e)}"}, status=500)