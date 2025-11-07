from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from models.models import Location, User
from django.db import connection

from services.activity_logger import log_user_activity

# Create your views here.
"""
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  hasLocation: boolean;
  userCount: number;
  imageCount: number;
  avgBeanSize: number;
  qualityRating: number;
  lastActivity: string;
  owner: string;
  createdDate: string;
  totalUploads: number;
  validatedUploads: number;
"""
@api_view(['GET'])
def get_farms(request):
    try:
        # Using Cursor to fetch data from the database
        with connection.cursor() as cursor:
            cursor.execute("""
              SELECT 
                DISTINCT
                loc.id,  
                loc.name, 
                loc.longitude AS lon,
                loc.latitude AS lat,
                (
                SELECT CONCAT(us.first_name, '',us.last_name)
                FROM public.users AS us
                JOIN public.user_roles ur
                ON us.id=ur.user_id
                JOIN public.roles r
                ON r.id=ur.role_id 
                JOIN public.locations l 
                ON l.id=us.location_id
                WHERE r.name = 'farmer' AND l.id = loc.id
                ORDER BY us.last_login ASC
                LIMIT 1
                ) AS owner, 
                COUNT(DISTINCT us.id) AS userCount,
                (CASE WHEN loc.latitude IS NULL OR loc.longitude IS NULL THEN false ELSE true END) AS hasLocation,
                COUNT(DISTINCT ui.ID) as imageCount,
                CONCAT(ROUND(AVG(ef.major_axis_length),2),'long x ',ROUND(AVG(ef.minor_axis_length),2), 'wide') as avgBeanSize,
                'Good Quality' as qualityRating,
                'Remov This' as lastActivity,
                'Remov This' as createdDate,
                'Remov This redundant' as totalUploads,
                COUNT(DISTINCT CASE 
                  WHEN (a.label->>'is_validated')::boolean = false 
                  THEN i.id 
                END
                ) as pendingValidations,
                COUNT(
                DISTINCT CASE 
                  WHEN (a.label->>'is_validated')::boolean = true 
                  THEN i.id 
                END
                ) as validatedUploads
              FROM 
                public.locations AS loc
              FULL JOIN
                public.users AS us
              ON 
                loc.id = us.location_id 
              LEFT JOIN
                public.user_images AS ui
              ON
                us.id=ui.user_id
              LEFT JOIN
                public.images AS i
              ON
                i.id=ui.image_id
              LEFT JOIN 
                public.annotations as a
              ON 
                i.id=a.image_id
              LEFT JOIN 
                public.predictions AS pred
              ON
                pred.image_id=i.id
              LEFT JOIN 
                public.extracted_features as ef
              ON 
                pred.id=ef.prediction_id
              GROUP BY
                loc.id;
            """)
            
            columns = [col[0] for col in cursor.description]
            locations = [dict(zip(columns, row)) for row in cursor.fetchall()]
            print(locations)
        farms = []
        for loc in locations:
            if loc['id'] is not None:  # Only include farms with valid location data
                farm = {
                    'id': str(loc['id']),
                    'name': loc['name'],
                    'lat': loc['lat'],
                    'lng': loc['lon'],
                    'hasLocation': loc['haslocation'],
                    'userCount': loc['usercount'],
                    'imageCount': loc['imagecount'],
                    'avgBeanSize': loc['avgbeansize'],
                    'qualityRating': loc['qualityrating'],
                    'lastActivity': loc['lastactivity'],
                    'owner': loc['owner'],
                    'createdDate': loc['createddate'],
                    'totalUploads': loc['totaluploads'],
                    'validatedUploads': loc['validateduploads'],
                    'pendingValidations': loc['pendingvalidations'],
                }
                farms.append(farm)
           
        return JsonResponse({"data": farms}, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_view(['POST'])
def create_farm(request):
    try:
        name = request.data.get('name')

        if not all([name]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Create a new Location instance using raw SQL to avoid geometry field issues
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO public.locations (name) VALUES (%s)",
                [name]
            )
        log_user_activity(
            user_id=request.data.get('user_id', None),
            action="CREATE",
            details=f"Created farm {name}",
            resource=f"Farm ID: {cursor.lastrowid}",
            status="success"
        )

        return JsonResponse({"success": True}, status=201)

    except Exception as e:
        log_user_activity(
            user_id=request.data.get('user_id', None),
            action="CREATE",
            details=f"Failed to create farm {name}",
            resource="Farm",
            status="error"
        )
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
def update_farm_location(request, farm_id):
    try:
        lat = request.data.get('lat')
        lng = request.data.get('lng')

        if not all([lat, lng]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Update the Location instance using simple latitude/longitude fields
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE public.locations SET latitude = %s, longitude = %s WHERE id = %s",
                [lat, lng, farm_id]
            )
        log_user_activity(
            user_id=request.data.get('user_id', None),
            action="UPDATE",
            details=f"Updated location for farm ID {farm_id} to ({lat}, {lng})",
            resource=f"Farm ID: {farm_id}",
            status="success"
        )
        
        return JsonResponse({"success": True}, status=200)

    except Exception as e:
        log_user_activity(
            user_id=request.data.get('user_id', None),
            action="UPDATE",
            details=f"Failed to update location for farm ID {farm_id}",
            resource=f"Farm ID: {farm_id}",
            status="error"
        )
        return JsonResponse({"error": str(e)}, status=500)
    
@api_view(['GET'])
def get_farm_details(request, farm_id):
    try:
        with connection.cursor() as cursor:
            # Execute the users query
            
            cursor.execute("""
              SELECT 
                u.id as id,
                CONCAT(u.first_name,' ',u.last_name) as name, 
                r.name as role,
                COUNT(ui.id) as uploads
              FROM public.users as u
              JOIN public.user_roles as ur
              ON u.id=ur.user_id
              JOIN public.roles as r
              ON r.id=ur.role_id
              FULL JOIN public.user_images as ui
              ON ui.user_id=u.id
              JOIN public.locations as loc
              ON loc.id=u.location_id
              WHERE loc.id = %s
              GROUP BY 
                loc.id,u.id,u.first_name,u.last_name,r.name
            """, [farm_id])

            users_columns = [col[0] for col in cursor.description]
            users_data = [dict(zip(users_columns, row)) for row in cursor.fetchall()]

            # Execute the recent images query
            cursor.execute("""
              SELECT 
                i.id as id,
                i.image_url as url,
                i.upload_date as uploadDate,
                COUNT(p.id) as beanCount
              FROM public.images as i
              FULL JOIN public.predictions as p
              ON i.id=p.image_id
              LEFT JOIN public.locations as loc
              ON loc.id=i.location_id
              JOIN public.user_images as ui
              ON ui.image_id=i.id
              WHERE loc.id = %s
              GROUP BY 
                i.id,i.image_url,i.upload_date
              ORDER BY i.upload_date DESC
              LIMIT 5
            """, [farm_id])

            images_columns = [col[0] for col in cursor.description]
            images_data = [dict(zip(images_columns, row)) for row in cursor.fetchall()]

            # Execute the comprehensive morphological features query
            cursor.execute("""
              SELECT 
                -- Individual farm averages
                AVG(ef.major_axis_length) as avgBeanLength,
                AVG(ef.minor_axis_length) as avgBeanWidth,
                AVG(ef.area) as avgBeanArea,
                AVG(ef.perimeter) as avgBeanPerimeter,
                AVG(ef.extent) as avgBeanExtent,
                AVG(ef.eccentricity) as avgBeanEccentricity,
                AVG(ef.convex_area) as avgBeanConvexArea,
                AVG(ef.solidity) as avgBeanSolidity,
                AVG(ef.mean_intensity) as avgBeanMeanIntensity,
                AVG(ef.equivalent_diameter) as avgBeanEquivalentDiameter,
                -- Calculated features
                AVG(CASE 
                  WHEN ef.minor_axis_length > 0 
                  THEN ef.major_axis_length / ef.minor_axis_length 
                  ELSE 0 
                END) as avgAspectRatio,
                AVG(CASE 
                  WHEN ef.perimeter > 0 
                  THEN (4.0 * 3.14159 * ef.area) / (ef.perimeter * ef.perimeter) 
                  ELSE 0 
                END) as avgCircularity,
                ARRAY_AGG(DISTINCT p.predicted_label->>'bean_type') AS commonBeanTypes
              FROM 
                public.extracted_features as ef
              JOIN 
                public.predictions as p
              ON p.id=ef.prediction_id
              JOIN 
                public.images as i
              ON i.id=p.image_id
              WHERE i.location_id = %s
              GROUP BY i.location_id
            """, [farm_id])

            agg_result = cursor.fetchone()
            
            # Get overall database averages for comparison
            cursor.execute("""
              SELECT 
                AVG(ef.major_axis_length) as overallAvgLength,
                AVG(ef.minor_axis_length) as overallAvgWidth,
                AVG(ef.area) as overallAvgArea,
                AVG(ef.perimeter) as overallAvgPerimeter,
                AVG(ef.extent) as overallAvgExtent,
                AVG(ef.eccentricity) as overallAvgEccentricity,
                AVG(ef.convex_area) as overallAvgConvexArea,
                AVG(ef.solidity) as overallAvgSolidity,
                AVG(ef.mean_intensity) as overallAvgMeanIntensity,
                AVG(ef.equivalent_diameter) as overallAvgEquivalentDiameter,
                AVG(CASE 
                  WHEN ef.minor_axis_length > 0 
                  THEN ef.major_axis_length / ef.minor_axis_length 
                  ELSE 0 
                END) as overallAvgAspectRatio,
                AVG(CASE 
                  WHEN ef.perimeter > 0 
                  THEN (4.0 * 3.14159 * ef.area) / (ef.perimeter * ef.perimeter) 
                  ELSE 0 
                END) as overallAvgCircularity
              FROM 
                public.extracted_features as ef
              JOIN 
                public.predictions as p
              ON p.id=ef.prediction_id
            """)
            
            overall_result = cursor.fetchone()
            
            aggregated_data = {}
            if agg_result and overall_result:
              # Helper function to determine status
              def get_status(farm_avg, overall_avg, tolerance=0.1):
                if farm_avg is None or overall_avg is None:
                  return 'neutral'
                
                lower_bound = overall_avg * (1 - tolerance)
                upper_bound = overall_avg * (1 + tolerance)
                
                if farm_avg < lower_bound:
                  return 'below'
                elif farm_avg > upper_bound:
                  return 'above'
                else:
                  return 'neutral'
              
              aggregated_data = {
                'area': {
                  'value': float(agg_result[2]) if agg_result[2] else 0,
                  'overall': float(overall_result[2]) if overall_result[2] else 0,
                  'status': get_status(float(agg_result[2]) if agg_result[2] else 0, float(overall_result[2]) if overall_result[2] else 0)
                },
                'perimeter': {
                  'value': float(agg_result[3]) if agg_result[3] else 0,
                  'overall': float(overall_result[3]) if overall_result[3] else 0,
                  'status': get_status(float(agg_result[3]) if agg_result[3] else 0, float(overall_result[3]) if overall_result[3] else 0)
                },
                'major_axis_length': {
                  'value': float(agg_result[0]) if agg_result[0] else 0,
                  'overall': float(overall_result[0]) if overall_result[0] else 0,
                  'status': get_status(float(agg_result[0]) if agg_result[0] else 0, float(overall_result[0]) if overall_result[0] else 0)
                },
                'minor_axis_length': {
                  'value': float(agg_result[1]) if agg_result[1] else 0,
                  'overall': float(overall_result[1]) if overall_result[1] else 0,
                  'status': get_status(float(agg_result[1]) if agg_result[1] else 0, float(overall_result[1]) if overall_result[1] else 0)
                },
                'extent': {
                  'value': float(agg_result[4]) if agg_result[4] else 0,
                  'overall': float(overall_result[4]) if overall_result[4] else 0,
                  'status': get_status(float(agg_result[4]) if agg_result[4] else 0, float(overall_result[4]) if overall_result[4] else 0)
                },
                'eccentricity': {
                  'value': float(agg_result[5]) if agg_result[5] else 0,
                  'overall': float(overall_result[5]) if overall_result[5] else 0,
                  'status': get_status(float(agg_result[5]) if agg_result[5] else 0, float(overall_result[5]) if overall_result[5] else 0)
                },
                'convex_area': {
                  'value': float(agg_result[6]) if agg_result[6] else 0,
                  'overall': float(overall_result[6]) if overall_result[6] else 0,
                  'status': get_status(float(agg_result[6]) if agg_result[6] else 0, float(overall_result[6]) if overall_result[6] else 0)
                },
                'solidity': {
                  'value': float(agg_result[7]) if agg_result[7] else 0,
                  'overall': float(overall_result[7]) if overall_result[7] else 0,
                  'status': get_status(float(agg_result[7]) if agg_result[7] else 0, float(overall_result[7]) if overall_result[7] else 0)
                },
                'mean_intensity': {
                  'value': float(agg_result[8]) if agg_result[8] else 0,
                  'overall': float(overall_result[8]) if overall_result[8] else 0,
                  'status': get_status(float(agg_result[8]) if agg_result[8] else 0, float(overall_result[8]) if overall_result[8] else 0)
                },
                'equivalent_diameter': {
                  'value': float(agg_result[9]) if agg_result[9] else 0,
                  'overall': float(overall_result[9]) if overall_result[9] else 0,
                  'status': get_status(float(agg_result[9]) if agg_result[9] else 0, float(overall_result[9]) if overall_result[9] else 0)
                },
                'aspect_ratio': {
                  'value': float(agg_result[10]) if agg_result[10] else 0,
                  'overall': float(overall_result[10]) if overall_result[10] else 0,
                  'status': get_status(float(agg_result[10]) if agg_result[10] else 0, float(overall_result[10]) if overall_result[10] else 0)
                },
                'circularity': {
                  'value': float(agg_result[11]) if agg_result[11] else 0,
                  'overall': float(overall_result[11]) if overall_result[11] else 0,
                  'status': get_status(float(agg_result[11]) if agg_result[11] else 0, float(overall_result[11]) if overall_result[11] else 0)
                },
                'commonBeanTypes': agg_result[12] if agg_result[12] else [],
                'qualityDistribution': {},
                'monthlyUploads': []
              }

            # Execute the monthly uploads query
            cursor.execute("""
              SELECT 
                TO_CHAR(i.upload_date,'Month') AS month,
                COUNT(i.id) as count
              FROM public.images as i 
              WHERE i.location_id = %s
              GROUP BY i.location_id, TO_CHAR(i.upload_date,'Month')
              ORDER BY TO_CHAR(i.upload_date,'Month')
            """, [farm_id])

            monthly_columns = [col[0] for col in cursor.description]
            monthly_data = [dict(zip(monthly_columns, row)) for row in cursor.fetchall()]

            # Format the response data
            users = [
              {
                'id': str(user['id']),
                'name': user['name'],
                'role': user['role'],
                'uploads': user['uploads']
              } for user in users_data
            ]
            baseUrl = 'https://sodfcdrqpvcsblclppne.supabase.co/storage/v1/object/public/Beans/'
            recentImages = [
              {
                'id': str(image['id']),
                'url': baseUrl + image['url'],
                'uploadDate': image['uploaddate'].isoformat() if image['uploaddate'] else '',
                'beanCount': image['beancount']
              } for image in images_data
            ]

            aggregated_data['monthlyUploads'] = monthly_data

            data = {
              'users': users,
              'recentImages': recentImages,
              'aggregatedData': aggregated_data
            }
           
            return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def delete_farm(request):
    try:
        farm_id = request.data.get("farm_id")
        print(farm_id)
        # All users associated with this farm will change their location int NULL
        users = User.objects.filter(location_id=farm_id)
        users.update(location_id=None)
        with connection.cursor() as cursor:
            # Delete the Location instance using raw SQL
            cursor.execute(
                "DELETE FROM public.locations WHERE id = %s",
                [farm_id]
            )
        log_user_activity(
            user_id=request.data.get('user_id', None),
            action="DELETE",
            details=f"Deleted farm ID {farm_id}",
            resource=f"Farm ID: {farm_id}",
            status="success"
        )
        
        return JsonResponse({"success": True}, status=200)

    except Exception as e:
        log_user_activity(
            user_id=request.data.get('user_id', None),
            action="DELETE",
            details=f"Failed to delete farm ID {farm_id}",
            resource=f"Farm ID: {farm_id}",
            status="error"
        )
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
def get_farm_view(request, farm_id):
    """
    Simplified farm view endpoint for researchers and farmers.
    Returns combined analytics, users, and recent images data.
    """
    try:
        with connection.cursor() as cursor:
            # Get basic farm info
            cursor.execute("""
                SELECT 
                    id, 
                    name,
                    longitude AS lon,
                    latitude AS lat
                FROM public.locations 
                WHERE id = %s
            """, [farm_id])
            
            farm_row = cursor.fetchone()
            if not farm_row:
                return JsonResponse({"error": "Farm not found"}, status=404)
            
            farm_basic = {
                'id': str(farm_row[0]),
                'name': farm_row[1],
                'lng': farm_row[2],
                'lat': farm_row[3]
            }

            # Get users with their upload counts
            cursor.execute("""
                SELECT 
                    u.id as id,
                    CONCAT(u.first_name,' ',u.last_name) as name, 
                    r.name as role,
                    COUNT(ui.id) as uploads
                FROM public.users as u
                JOIN public.user_roles as ur ON u.id = ur.user_id
                JOIN public.roles as r ON r.id = ur.role_id
                LEFT JOIN public.user_images as ui ON ui.user_id = u.id
                WHERE u.location_id = %s
                GROUP BY u.id, u.first_name, u.last_name, r.name
                ORDER BY uploads DESC
            """, [farm_id])

            users_columns = [col[0] for col in cursor.description]
            users_data = [dict(zip(users_columns, row)) for row in cursor.fetchall()]

            # Get recent images
            cursor.execute("""
                SELECT 
                    i.id as id,
                    i.image_url as url,
                    i.upload_date as uploaddate,
                    COUNT(p.id) as beancount
                FROM public.images as i
                LEFT JOIN public.predictions as p ON i.id = p.image_id
                JOIN public.user_images as ui ON ui.image_id = i.id
                JOIN public.users u ON ui.user_id = u.id
                WHERE u.location_id = %s
                GROUP BY i.id, i.image_url, i.upload_date
                ORDER BY i.upload_date DESC
                LIMIT 6
            """, [farm_id])

            images_columns = [col[0] for col in cursor.description]
            images_data = [dict(zip(images_columns, row)) for row in cursor.fetchall()]

            # Get aggregated morphological data
            cursor.execute("""
                SELECT 
                    AVG(ef.major_axis_length) as major_axis_length,
                    AVG(ef.minor_axis_length) as minor_axis_length,
                    AVG(ef.area) as area,
                    AVG(ef.perimeter) as perimeter,
                    AVG(ef.major_axis_length / ef.minor_axis_length) as aspect_ratio,
                    AVG((4.0 * 3.14159 * ef.area) / (ef.perimeter * ef.perimeter)) as circularity,
                    AVG(ef.extent) as extent,
                    AVG(ef.eccentricity) as eccentricity,
                    AVG(ef.solidity) as solidity,
                    AVG(ef.equivalent_diameter) as equivalent_diameter
                FROM public.extracted_features as ef
                JOIN public.predictions as p ON ef.prediction_id = p.id
                JOIN public.images as i ON p.image_id = i.id
                JOIN public.user_images as ui ON ui.image_id = i.id
                JOIN public.users as u ON ui.user_id = u.id
                WHERE u.location_id = %s
            """, [farm_id])

            morph_row = cursor.fetchone()
            
            # Get overall averages for comparison
            cursor.execute("""
                SELECT 
                    AVG(ef.major_axis_length) as major_axis_length,
                    AVG(ef.minor_axis_length) as minor_axis_length,
                    AVG(ef.area) as area,
                    AVG(ef.perimeter) as perimeter,
                    AVG(ef.major_axis_length / ef.minor_axis_length) as aspect_ratio,
                    AVG((4.0 * 3.14159 * ef.area) / (ef.perimeter * ef.perimeter)) as circularity,
                    AVG(ef.extent) as extent,
                    AVG(ef.eccentricity) as eccentricity,
                    AVG(ef.solidity) as solidity,
                    AVG(ef.equivalent_diameter) as equivalent_diameter
                FROM public.extracted_features as ef
                JOIN public.predictions as p ON ef.prediction_id = p.id
            """)

            overall_row = cursor.fetchone()

            # Get monthly uploads data
            cursor.execute("""
                SELECT 
                    TO_CHAR(i.upload_date, 'YYYY-MM') as month,
                    COUNT(*) as uploads
                FROM public.images as i
                JOIN public.user_images as ui ON ui.image_id = i.id
                JOIN public.users as u ON ui.user_id = u.id
                WHERE u.location_id = %s 
                AND i.upload_date >= NOW() - INTERVAL '12 months'
                GROUP BY TO_CHAR(i.upload_date, 'YYYY-MM')
                ORDER BY month
            """, [farm_id])

            monthly_columns = [col[0] for col in cursor.description]
            monthly_data = [dict(zip(monthly_columns, row)) for row in cursor.fetchall()]

            # Get bean types
            cursor.execute("""
                SELECT DISTINCT p.predicted_label->>'bean_type' as bean_type
                FROM public.predictions as p
                JOIN public.images as i ON p.image_id = i.id
                JOIN public.user_images as ui ON ui.image_id = i.id
                JOIN public.users as u ON ui.user_id = u.id
                WHERE u.location_id = %s
                AND p.predicted_label->>'bean_type' IS NOT NULL
            """, [farm_id])

            bean_types = [row[0] for row in cursor.fetchall() if row[0]]

            # Build aggregated data structure
            aggregated_data = {}
            if morph_row and overall_row:
                features = [
                    'major_axis_length', 'minor_axis_length', 'area', 'perimeter',
                    'aspect_ratio', 'circularity', 'extent', 'eccentricity',
                    'solidity', 'equivalent_diameter'
                ]
                
                for i, feature in enumerate(features):
                    farm_val = float(morph_row[i]) if morph_row[i] is not None else 0.0
                    overall_val = float(overall_row[i]) if overall_row[i] is not None else 0.0
                    
                    status = 'neutral'
                    if overall_val > 0:
                        if farm_val > overall_val * 1.1:
                            status = 'above'
                        elif farm_val < overall_val * 0.9:
                            status = 'below'
                    
                    aggregated_data[feature] = {
                        'value': farm_val,
                        'overall': overall_val,
                        'status': status
                    }

            # Format images data
            baseUrl = 'https://sodfcdrqpvcsblclppne.supabase.co/storage/v1/object/public/Beans/'
            recent_images = [
                {
                    'id': str(image['id']),
                    'url': baseUrl + image['url'] if image['url'] else '',
                    'uploadDate': image['uploaddate'].isoformat() if image['uploaddate'] else '',
                    'beanCount': image['beancount'] or 0
                } for image in images_data
            ]

            # Build response
            data = {
                **farm_basic,
                'users': users_data,
                'recentImages': recent_images,
                'aggregatedData': aggregated_data,
                'beanTypes': bean_types,
                'monthlyUploads': monthly_data
            }

            return JsonResponse(data, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)