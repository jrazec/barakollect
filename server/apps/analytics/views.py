from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db import connection
from services.supabase_service import supabase
from models.models import UserImage, User

# Create your views here.
# @api_view(['GET'])
# def render_farmer_dashboard(request, uiid):
#     # query here
#     # Get the location_id of the current user
#     location_id = User.objects.filter(id=uiid).values('location_id').first()
#     # Print the values in beautification
#     print(location_id)
#     with connection.cursor() as cursor:
#         cursor.execute("SELECT major_axis_length,area FROM extracted_features JOIN predictions ON extracted_features.prediction_id = predictions.id JOIN images ON predictions.image_id = images.id WHERE images.location_id = %s;", [location_id['location_id']])
#         data = cursor.fetchall()
#     return JsonResponse({'data': (data[0][0] if data[0][0] is not None else 0)})

@api_view(['GET'])
def render_farmer_dashboard(request, uiid):
    """
    Dashboard API: returns summary stats for a given farmer (user) and global averages.
    """

    # Get location_id for this user
    location = User.objects.filter(id=uiid).values('location_id').first()
    if not location or not location['location_id']:
        return JsonResponse({"error": "User location not found"}, status=404)

    location_id = location['location_id']

    def fetch_stats(where_clause, params):
        with connection.cursor() as cursor:
            #Avg area
            cursor.execute(f"""
                SELECT AVG(area)
                FROM bean_detections bd
                JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                JOIN predictions p ON ef.prediction_id = p.id
                JOIN images i ON p.image_id = i.id
                {where_clause}
            """, params)
            avg_area = cursor.fetchone()
            
            # Avg size
            cursor.execute(f"""
                SELECT AVG(length_mm), AVG(width_mm)
                FROM bean_detections bd
                JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                JOIN predictions p ON ef.prediction_id = p.id
                JOIN images i ON p.image_id = i.id
                {where_clause}
            """, params)
            avg_size = cursor.fetchone()

            # Largest bean: include dimensions, bbox, and image_url
            cursor.execute(f"""
                SELECT bd.id AS bean_id,
                    bd.length_mm, bd.width_mm,
                    bd.bbox_x, bd.bbox_y, bd.bbox_width, bd.bbox_height,
                    i.image_url
                FROM bean_detections bd
                JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                JOIN predictions p ON ef.prediction_id = p.id
                JOIN images i ON p.image_id = i.id
                {where_clause}
                ORDER BY bd.length_mm DESC
                LIMIT 1
            """, params)
            largest = cursor.fetchone()

            # Shape consistency
            cursor.execute(f"""
                SELECT AVG(length_mm / NULLIF(width_mm, 0)),
                       STDDEV(length_mm / NULLIF(width_mm, 0))
                FROM bean_detections bd
                JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                JOIN predictions p ON ef.prediction_id = p.id
                JOIN images i ON p.image_id = i.id
                {where_clause}
            """, params)
            shape_consistency = cursor.fetchone()

            # Yield potential
            cursor.execute(f"""
                SELECT COUNT(*)
                FROM bean_detections bd
                JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                JOIN predictions p ON ef.prediction_id = p.id
                JOIN images i ON p.image_id = i.id
                {where_clause}
            """, params)
            yield_count = cursor.fetchone()

            # Density indicators
            cursor.execute(f"""
                SELECT AVG(solidity), AVG(extent)
                FROM extracted_features ef
                JOIN predictions p ON ef.prediction_id = p.id
                JOIN images i ON p.image_id = i.id
                {where_clause}
            """, params)
            density = cursor.fetchone()

        return {
            "average_area": float(avg_area[0]) if avg_area[0] else 0,
            "average_size": {
                "length_mm": float(avg_size[0]) if avg_size[0] else 0,
                "width_mm": float(avg_size[1]) if avg_size[1] else 0,
            },
            "largest_bean": {
                "bean_id": int(largest[0]) if largest and largest[0] else None,
                "length_mm": float(largest[1]) if largest and largest[1] else 0,
                "width_mm": float(largest[2]) if largest and largest[2] else 0,
                "bbox_x": float(largest[3]) if largest and largest[3] else 0,
                "bbox_y": float(largest[4]) if largest and largest[4] else 0,
                "bbox_width": float(largest[5]) if largest and largest[5] else 0,
                "bbox_height": float(largest[6]) if largest and largest[6] else 0,
                # !! temporary ↴ --► largest bean is the weird amalgamation of 4 beans lol
                "image_url": largest[7] if largest and largest[7] else None, 
                # "image_url": (
                #     supabase.storage.from_("Beans").get_public_url(largest[7])
                #     if largest and largest[7] else None
                # ),
            },
            "shape_consistency": {
                "avg_aspect_ratio": float(shape_consistency[0]) if shape_consistency[0] else 0,
                "std_aspect_ratio": float(shape_consistency[1]) if shape_consistency[1] else 0,
            },
            "yield_potential": int(yield_count[0]) if yield_count[0] else 0,
            "density_fullness": {
                "solidity": float(density[0]) if density[0] else 0,
                "extent": float(density[1]) if density[1] else 0,
            }
        }

    # Farmer-specific stats
    farmer_stats = fetch_stats("WHERE i.location_id = %s", [location_id])

    # Global (all farms) stats
    global_stats = fetch_stats("", [])

    return JsonResponse({
        "farmer": farmer_stats,
        "global": global_stats
    })