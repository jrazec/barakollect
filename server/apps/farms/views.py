from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from models.models import Location, User
from django.db import connection

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
                ST_X(loc.location::geometry) AS lon,
                ST_Y(loc.location::geometry) AS lat,
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
                (CASE WHEN loc.location IS NULL THEN false ELSE true END) AS hasLocation,
                COUNT(DISTINCT ui.ID) as imageCount,
                CONCAT(AVG(ef.major_axis_length),'long x ',AVG(ef.minor_axis_length), 'wide') as avgBeanSize,
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
        
        return JsonResponse({"success": True}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
def update_farm_location(request, farm_id):
    try:
        lat = request.data.get('lat')
        lng = request.data.get('lng')

        if not all([lat, lng]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Update the Location instance using raw SQL to handle geometry field
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE public.locations SET location = ST_SetSRID(ST_MakePoint(%s, %s), 4326) WHERE id = %s",
                [lng, lat, farm_id]
            )
        
        return JsonResponse({"success": True}, status=200)

    except Exception as e:
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
              LIMIT 3
            """, [farm_id])

            images_columns = [col[0] for col in cursor.description]
            images_data = [dict(zip(images_columns, row)) for row in cursor.fetchall()]

            # Execute the aggregated data query
            cursor.execute("""
              SELECT 
                AVG(ef.major_axis_length) as avgBeanLength,
                AVG(ef.minor_axis_length) as avgBeanWidth,
                AVG(ef.area) as avgBeanArea,
                ARRAY_AGG(DISTINCT p.predicted_label->>'bean_type') AS commonBeanTypes
                -- MODE() WITHIN GROUP (ORDER BY p.predicted_label->>'bean_type') as commonBeanTypes
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
            aggregated_data = {}
            if agg_result:
              aggregated_data = {
                'avgBeanLength': float(agg_result[0]) if agg_result[0] else 0,
                'avgBeanWidth': float(agg_result[1]) if agg_result[1] else 0,
                'avgBeanArea': float(agg_result[2]) if agg_result[2] else 0,
                'commonBeanTypes': [agg_result[3]] if agg_result[3] else [],
                'qualityDistribution': {},
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

            recentImages = [
              {
                'id': str(image['id']),
                'url': image['url'],
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
        
        return JsonResponse({"success": True}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)