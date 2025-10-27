from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db import connection
from services.supabase_service import supabase
from models.models import UserImage, User
import math
import pandas as pd
from collections import Counter

# === Farmer Dashboard ファルマー　❘ 農家
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
                # !! temporary ↴
                # "image_url": largest[7] if largest and largest[7] else None, 
                "image_url": (
                    supabase.storage.from_("Beans").get_public_url(largest[7])
                    if largest and largest[7] else None
                ),
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

    # Additional analytics for charts
    with connection.cursor() as cursor:
        # First, calculate dynamic thresholds based on data distribution
        # Using 33rd and 67th percentiles for Small/Medium/Large categories
        cursor.execute("""
            SELECT 
                PERCENTILE_CONT(0.33) WITHIN GROUP (ORDER BY bd.length_mm) as p33_length,
                PERCENTILE_CONT(0.67) WITHIN GROUP (ORDER BY bd.length_mm) as p67_length,
                MIN(bd.length_mm) as min_length,
                MAX(bd.length_mm) as max_length,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY bd.length_mm) as median_length
            FROM bean_detections bd
            JOIN extracted_features ef ON bd.extracted_features_id = ef.id
            JOIN predictions p ON ef.prediction_id = p.id
            JOIN images i ON p.image_id = i.id
        """)
        thresholds = cursor.fetchone()
        
        if thresholds and thresholds[0]:
            p33_length, p67_length = float(thresholds[0]), float(thresholds[1])
            min_length, max_length, median_length = float(thresholds[2]), float(thresholds[3]), float(thresholds[4])
        else:
            # Fallback to default values if no data
            p33_length, p67_length = 8.0, 12.0
            min_length, max_length, median_length = 5.0, 15.0, 10.0

        # 1. Bean Size Distribution (for bar chart comparison) - Dynamic categorization
        cursor.execute("""
            SELECT 
                size_category,
                COUNT(*) as farmer_count
            FROM (
                SELECT 
                    CASE 
                        WHEN bd.length_mm < %s THEN 'Small'
                        WHEN bd.length_mm BETWEEN %s AND %s THEN 'Medium'
                        ELSE 'Large'
                    END AS size_category
                FROM bean_detections bd
                JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                JOIN predictions p ON ef.prediction_id = p.id
                JOIN images i ON p.image_id = i.id
                WHERE i.location_id = %s
            ) AS categorized
            GROUP BY size_category
            ORDER BY 
                CASE size_category
                    WHEN 'Small' THEN 1
                    WHEN 'Medium' THEN 2
                    WHEN 'Large' THEN 3
                END
        """, [p33_length, p33_length, p67_length, location_id])
        farmer_size_dist = cursor.fetchall()

        cursor.execute("""
            SELECT 
                size_category,
                COUNT(*) as global_count
            FROM (
                SELECT 
                    CASE 
                        WHEN bd.length_mm < %s THEN 'Small'
                        WHEN bd.length_mm BETWEEN %s AND %s THEN 'Medium'
                        ELSE 'Large'
                    END AS size_category
                FROM bean_detections bd
                JOIN extracted_features ef ON bd.extracted_features_id = ef.id
                JOIN predictions p ON ef.prediction_id = p.id
                JOIN images i ON p.image_id = i.id
            ) AS categorized
            GROUP BY size_category
            ORDER BY 
                CASE size_category
                    WHEN 'Small' THEN 1
                    WHEN 'Medium' THEN 2
                    WHEN 'Large' THEN 3
                END
        """, [p33_length, p33_length, p67_length])
        global_size_dist = cursor.fetchall()

        # Combine distributions
        size_distribution = {}
        for category, count in farmer_size_dist:
            if category not in size_distribution:
                size_distribution[category] = {"category": category, "farmer": 0, "global": 0}
            size_distribution[category]["farmer"] = int(count)
        
        for category, count in global_size_dist:
            if category not in size_distribution:
                size_distribution[category] = {"category": category, "farmer": 0, "global": 0}
            size_distribution[category]["global"] = int(count)

        # 2. Yield vs Quality (scatter plot data)
        cursor.execute("""
            SELECT 
                i.id as image_id,
                DATE(i.upload_date) as date,
                COUNT(bd.id) as yield,
                AVG(ef.area) as avg_area,
                AVG(ef.solidity) as avg_solidity
            FROM images i
            JOIN predictions p ON i.id = p.image_id
            JOIN extracted_features ef ON p.id = ef.prediction_id
            JOIN bean_detections bd ON ef.id = bd.extracted_features_id
            WHERE i.location_id = %s
            GROUP BY i.id, i.upload_date
            ORDER BY i.upload_date DESC
            LIMIT 50
        """, [location_id])
        yield_quality = cursor.fetchall()

        # 3. Enhanced Farm Comparison (compare with top farms and province average)
        cursor.execute("""
            SELECT 
                AVG(bd.length_mm) as avg_length,
                AVG(bd.width_mm) as avg_width,
                AVG(ef.solidity) as avg_solidity,
                AVG(bd.length_mm / NULLIF(bd.width_mm, 0)) as avg_aspect_ratio,
                AVG(ef.eccentricity) as avg_eccentricity
            FROM bean_detections bd
            JOIN extracted_features ef ON bd.extracted_features_id = ef.id
            JOIN predictions p ON ef.prediction_id = p.id
            JOIN images i ON p.image_id = i.id
            WHERE i.location_id = %s
        """, [location_id])
        farmer_comparison = cursor.fetchone()

        cursor.execute("""
            SELECT 
                AVG(bd.length_mm) as avg_length,
                AVG(bd.width_mm) as avg_width,
                AVG(ef.solidity) as avg_solidity,
                AVG(bd.length_mm / NULLIF(bd.width_mm, 0)) as avg_aspect_ratio,
                AVG(ef.eccentricity) as avg_eccentricity
            FROM bean_detections bd
            JOIN extracted_features ef ON bd.extracted_features_id = ef.id
            JOIN predictions p ON ef.prediction_id = p.id
            JOIN images i ON p.image_id = i.id
        """)
        province_comparison = cursor.fetchone()

        # Get top 5 farms by bean count for comparison
        cursor.execute("""
            SELECT 
                i.location_id,
                l.name,
                AVG(bd.length_mm) as avg_length,
                AVG(bd.width_mm) as avg_width,
                AVG(ef.solidity) as avg_solidity,
                AVG(ef.area) as avg_area,
                COUNT(bd.id) as bean_count
            FROM bean_detections bd
            JOIN extracted_features ef ON bd.extracted_features_id = ef.id
            JOIN predictions p ON ef.prediction_id = p.id
            JOIN images i ON p.image_id = i.id
            JOIN locations l ON i.location_id = l.id
            GROUP BY i.location_id, l.name
            ORDER BY bean_count DESC
            LIMIT 5
        """)
        top_farms = cursor.fetchall()

    return JsonResponse({
        "farmer": farmer_stats,
        "global": global_stats,
        "size_distribution": list(size_distribution.values()),
        "size_thresholds": {
            "small_max": round(p33_length, 2),
            "medium_min": round(p33_length, 2),
            "medium_max": round(p67_length, 2),
            "large_min": round(p67_length, 2),
            "min_length": round(min_length, 2),
            "max_length": round(max_length, 2),
            "median_length": round(median_length, 2)
        },
        "yield_quality": [
            {
                "image_id": image_id,
                "date": str(date),
                "yield": int(yield_val),
                "avg_area": float(avg_area) if avg_area else 0,
                "avg_solidity": float(avg_solidity) if avg_solidity else 0
            }
            for image_id, date, yield_val, avg_area, avg_solidity in yield_quality
        ],
        "farm_comparison": {
            "farmer": {
                "length": float(farmer_comparison[0]) if farmer_comparison[0] else 0,
                "width": float(farmer_comparison[1]) if farmer_comparison[1] else 0,
                "solidity": float(farmer_comparison[2]) if farmer_comparison[2] else 0,
                "aspect_ratio": float(farmer_comparison[3]) if farmer_comparison[3] else 0,
                "eccentricity": float(farmer_comparison[4]) if farmer_comparison[4] else 0
            },
            "province": {
                "length": float(province_comparison[0]) if province_comparison[0] else 0,
                "width": float(province_comparison[1]) if province_comparison[1] else 0,
                "solidity": float(province_comparison[2]) if province_comparison[2] else 0,
                "aspect_ratio": float(province_comparison[3]) if province_comparison[3] else 0,
                "eccentricity": float(province_comparison[4]) if province_comparison[4] else 0
            },
            "top_farms": [
                {
                    "farm_id": int(location_id),
                    "farm_name": farm_name if farm_name else f"Farm {location_id}",
                    "avg_length": float(avg_length) if avg_length else 0,
                    "avg_width": float(avg_width) if avg_width else 0,
                    "avg_solidity": float(avg_solidity) if avg_solidity else 0,
                    "avg_area": float(avg_area) if avg_area else 0,
                    "bean_count": int(bean_count)
                }
                for location_id, farm_name, avg_length, avg_width, avg_solidity, avg_area, bean_count in top_farms
            ]
        }
    })

# === Researcher Dashboard　リサーチャー　｜　研究者
def render_researcher_dashboard(request, uiid):
    # query for researcher dashboard data
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT ...
            FROM ...
            WHERE user_id = %s
        """, [uiid])
        researcher_data = cursor.fetchall()

    return JsonResponse({
        "researcher": researcher_data
    })

# === Admin Dashboard　アドミン　
@api_view(['GET'])
def render_admin_dashboard(request):
    # query 
    data = {}
    location_id = None # 6 -> 7 -> 8 ->
    role = None  # "researcher"
    year = None  # 2025
    with connection.cursor() as cursor:
        image_count = """
        SELECT COUNT(*) FROM images;
        """
        user_count = """
        SELECT COUNT(*) FROM users WHERE is_deleted = FALSE;
        """

        validated_count = """
        SELECT COUNT(DISTINCT image_id) FROM annotations WHERE (label->>'is_validated')::boolean = true;
        """
        unvalidated_count = """
        SELECT COUNT(DISTINCT image_id) FROM annotations WHERE (label->>'is_validated')::boolean = false;
        """          

        count_bean_types = """
        SELECT predicted_label->>'bean_type' AS bean_type, COUNT(DISTINCT predictions.id) as count
        FROM predictions
        JOIN images ON predictions.image_id = images.id
        JOIN users ON images.location_id = users.location_id
        JOIN user_roles ON users.id = user_roles.user_id
        JOIN roles ON user_roles.role_id = roles.id
        """
        count_top_uploaders = """
        SELECT users.id, users.first_name, users.last_name, COUNT(DISTINCT images.id) as upload_count
        FROM users
        JOIN user_images ON users.id = user_images.user_id
        JOIN images ON user_images.image_id = images.id
        JOIN user_roles ON users.id = user_roles.user_id
        JOIN roles ON user_roles.role_id = roles.id
        """
        total_beans_predicted_per_farm = """
        SELECT images.location_id as loc_id,  
                COUNT(DISTINCT CASE 
                  WHEN (a.label->>'is_validated')::boolean = false 
                  THEN a.id 
                END
                ) as pending, 
                COUNT(DISTINCT CASE 
                  WHEN (a.label->>'is_validated')::boolean = true 
                  THEN a.id 
                END
                ) as validated
        FROM images 
        JOIN annotations a ON images.id = a.image_id
        JOIN users ON images.location_id = users.location_id
        JOIN user_roles ON users.id = user_roles.user_id
        JOIN roles ON user_roles.role_id = roles.id
        """

        beans_features = """
        SELECT ef.major_axis_length, ef.minor_axis_length, ef.perimeter, ef.area, ef.solidity, ef.extent, ef.eccentricity, ef.mean_intensity
        FROM extracted_features ef TABLESAMPLE SYSTEM (100)
        JOIN predictions p ON ef.prediction_id = p.id
        JOIN images ON p.image_id = images.id
        JOIN users ON images.location_id = users.location_id
        JOIN user_roles ON users.id = user_roles.user_id
        JOIN roles ON user_roles.role_id = roles.id
        """
        if location_id or role or year:
            count_bean_types += " WHERE"
            count_top_uploaders += " WHERE"
            total_beans_predicted_per_farm += " WHERE"

            conditions = []
            params = []
            if location_id:
                conditions.append(" images.location_id = %s")
                params.append(location_id)
            if role:
                conditions.append(" roles.name = %s")
                params.append(role)
            if year:
                conditions.append(" EXTRACT(YEAR FROM images.upload_date) = %s")
                params.append(year)
            count_bean_types += " AND".join(conditions)
            count_top_uploaders += " AND".join(conditions)
            total_beans_predicted_per_farm += " AND".join(conditions)
        count_bean_types += " GROUP BY bean_type;"
        count_top_uploaders += " GROUP BY users.id, users.first_name, users.last_name ORDER BY upload_count DESC LIMIT 10;"
        total_beans_predicted_per_farm += " GROUP BY images.location_id;"

            
        cursor.execute(image_count)
        uploads = cursor.fetchall()
        cursor.execute(user_count)
        users = cursor.fetchall()
        cursor.execute(validated_count)
        validated = cursor.fetchall()
        cursor.execute(unvalidated_count)
        unvalidated = cursor.fetchall()
        cursor.execute(count_bean_types, [location_id, role, year])
        bean_types = cursor.fetchall()
        bean_type_data = {}
        for bean_type, count in bean_types:
            bean_type_data[bean_type] = count
        cursor.execute(count_top_uploaders, [location_id, role, year])
        top_uploaders = cursor.fetchall()
        top_uploader_data = []
        for user_id, first_name, last_name, upload_count in top_uploaders:
            top_uploader_data.append({
                "user_id": user_id,
                "name": f"{first_name} {last_name}",
                "upload_count": upload_count
            })
        cursor.execute(total_beans_predicted_per_farm, [location_id, role, year])
        farms = cursor.fetchall()
        farm_data = {}
        for loc_id, pend, val in farms:
            farm_data[f"{loc_id}"] = {
                "pending": pend,
                "validated": val
            }
        # Total beans predicted, Avg , Median and Mode(round into two decimal places first) Bean Features, Total Predictions, Average Confidence score, min and max of confidence score.

        # Bean Analytics Queries
        
        # Total predictions query
        total_predictions_query = """
        SELECT COUNT(*) FROM predictions p
        JOIN images ON p.image_id = images.id
        JOIN users ON images.location_id = users.location_id
        JOIN user_roles ON users.id = user_roles.user_id
        JOIN roles ON user_roles.role_id = roles.id
        """
        
        # Confidence score statistics
        confidence_stats_query = """
        SELECT AVG(CAST(predicted_label->>'confidence' AS FLOAT)) as avg_confidence,
               MIN(CAST(predicted_label->>'confidence' AS FLOAT)) as min_confidence,
               MAX(CAST(predicted_label->>'confidence' AS FLOAT)) as max_confidence
        FROM predictions p
        JOIN images ON p.image_id = images.id
        JOIN users ON images.location_id = users.location_id
        JOIN user_roles ON users.id = user_roles.user_id
        JOIN roles ON user_roles.role_id = roles.id
        """
        
        # Feature statistics per farm
        features_stats_query = """
        SELECT images.location_id,
               -- Area statistics
               AVG(ef.area) as area_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.area) as area_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.area, 2)) as area_mode,
               -- Perimeter statistics  
               AVG(ef.perimeter) as perimeter_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.perimeter) as perimeter_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.perimeter, 2)) as perimeter_mode,
               -- Major axis length statistics
               AVG(ef.major_axis_length) as major_axis_length_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.major_axis_length) as major_axis_length_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.major_axis_length, 2)) as major_axis_length_mode,
               -- Minor axis length statistics
               AVG(ef.minor_axis_length) as minor_axis_length_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.minor_axis_length) as minor_axis_length_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.minor_axis_length, 2)) as minor_axis_length_mode,
               -- Extent statistics
               AVG(ef.extent) as extent_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.extent) as extent_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.extent, 2)) as extent_mode,
               -- Eccentricity statistics
               AVG(ef.eccentricity) as eccentricity_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.eccentricity) as eccentricity_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.eccentricity, 2)) as eccentricity_mode,
               -- Convex area statistics
               AVG(ef.convex_area) as convex_area_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.convex_area) as convex_area_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.convex_area, 2)) as convex_area_mode,
               -- Solidity statistics
               AVG(ef.solidity) as solidity_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.solidity) as solidity_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.solidity, 2)) as solidity_mode,
               -- Mean intensity statistics
               AVG(ef.mean_intensity) as mean_intensity_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.mean_intensity) as mean_intensity_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.mean_intensity, 2)) as mean_intensity_mode,
               -- Equivalent diameter statistics
               AVG(ef.equivalent_diameter) as equivalent_diameter_mean,
               PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ef.equivalent_diameter) as equivalent_diameter_median,
               MODE() WITHIN GROUP (ORDER BY ROUND(ef.equivalent_diameter, 2)) as equivalent_diameter_mode
        FROM extracted_features ef
        JOIN predictions p ON ef.prediction_id = p.id
        JOIN images ON p.image_id = images.id
        JOIN users ON images.location_id = users.location_id
        JOIN user_roles ON users.id = user_roles.user_id
        JOIN roles ON user_roles.role_id = roles.id
        """
        
        # Apply filters if needed
        if location_id or role or year:
            total_predictions_query += " WHERE"
            confidence_stats_query += " WHERE"
            features_stats_query += " WHERE"
            
            conditions = []
            params = []
            if location_id:
                conditions.append(" images.location_id = %s")
                params.append(location_id)
            if role:
                conditions.append(" roles.name = %s")
                params.append(role)
            if year:
                conditions.append(" EXTRACT(YEAR FROM images.upload_date) = %s")
                params.append(year)
            
            condition_str = " AND".join(conditions)
            total_predictions_query += condition_str
            confidence_stats_query += condition_str
            features_stats_query += condition_str
            
            cursor.execute(total_predictions_query, params)
            total_predictions = cursor.fetchone()
            cursor.execute(confidence_stats_query, params)
            confidence_stats = cursor.fetchone()
            cursor.execute(features_stats_query + " GROUP BY images.location_id", params)
            features_stats = cursor.fetchall()
        else:
            cursor.execute(total_predictions_query)
            total_predictions = cursor.fetchone()
            cursor.execute(confidence_stats_query)
            confidence_stats = cursor.fetchone()
            cursor.execute(features_stats_query + " GROUP BY images.location_id")
            features_stats = cursor.fetchall()
        
        # Process feature statistics data
        feature_stats_data = {}
        feature_names = [
            'area', 'perimeter', 'major_axis_length', 'minor_axis_length', 
            'extent', 'eccentricity', 'convex_area', 'solidity', 
            'mean_intensity', 'equivalent_diameter'
        ]
        
        for feature in feature_names:
            feature_stats_data[feature] = {
                'mean': [],
                'median': [], 
                'mode': []
            }
        
        for row in features_stats:
            location_id_stats = row[0]
            for i, feature in enumerate(feature_names):
                mean_idx = 1 + (i * 3)
                median_idx = 2 + (i * 3)
                mode_idx = 3 + (i * 3)
                
                feature_stats_data[feature]['mean'].append({
                    'farm': f'Farm {location_id_stats}',
                    'value': float(row[mean_idx]) if row[mean_idx] is not None else 0
                })
                feature_stats_data[feature]['median'].append({
                    'farm': f'Farm {location_id_stats}',
                    'value': float(row[median_idx]) if row[median_idx] is not None else 0
                })
                feature_stats_data[feature]['mode'].append({
                    'farm': f'Farm {location_id_stats}',
                    'value': float(row[mode_idx]) if row[mode_idx] is not None else 0
                })

        # Feature Correlations

        # Correlation Matrix for Bean Features
        features_query = """
        SELECT ef.major_axis_length, ef.minor_axis_length, ef.perimeter, ef.area, ef.solidity, 
               ef.extent, ef.eccentricity, ef.mean_intensity, ef.convex_area, ef.equivalent_diameter
        FROM extracted_features ef 
        JOIN predictions p ON ef.prediction_id = p.id
        JOIN images ON p.image_id = images.id
        JOIN users ON images.location_id = users.location_id
        JOIN user_roles ON users.id = user_roles.user_id
        JOIN roles ON user_roles.role_id = roles.id
        """
        
        if location_id or role or year:
            features_query += " WHERE"
            conditions = []
            params = []
            if location_id:
                conditions.append(" images.location_id = %s")
                params.append(location_id)
            if role:
                conditions.append(" roles.name = %s")
                params.append(role)
            if year:
                conditions.append(" EXTRACT(YEAR FROM images.upload_date) = %s")
                params.append(year)
            features_query += " AND".join(conditions)
            cursor.execute(features_query, params)
        else:
            cursor.execute(features_query)
        
        features_data = cursor.fetchall()

        # Create DataFrame for correlation calculation
        feature_columns = [
            'major_axis_length', 'minor_axis_length', 'perimeter', 'area', 'solidity',
            'extent', 'eccentricity', 'mean_intensity', 'convex_area', 'equivalent_diameter'
        ]
        
        corr_feats = []
        if features_data:
            df = pd.DataFrame(features_data, columns=feature_columns)
            print(f"DataFrame shape: {df.shape}")
            print(f"Features data length: {len(features_data)}")
            print(df.head())
            corr = df.corr()
            print(f"Correlation matrix shape: {corr.shape}")
            print(corr)
            
            # Convert to a JSON structure usable by frontend
            for row_var in corr.index:
                row_data = {
                    "id": row_var,
                    "data": [{"x": col_var, "y": float(corr.at[row_var, col_var])} for col_var in corr.columns]
                }
                corr_feats.append(row_data)
            print(corr_feats)
        

        # Aspect Ratio and Roundness (Checking for Patterns in Bean Shapes)
        cursor.execute(beans_features, [location_id, role, year])
        beans_features = cursor.fetchall()
        scatter_ratio_roundness = []

        for bean in beans_features:
            scatter_ratio_roundness.append({
                "aspect_ratio": float(bean[0]) / float(bean[1]) if bean[1] != 0 else 0,
                "roundness": (4 * 3.1416 * float(bean[3])) / (float(bean[2]) ** 2) if bean[2] != 0 else 0
            })
        
        # Histogram
        bin_size = 0.1
        aspect_ratios = [d["aspect_ratio"] for d in scatter_ratio_roundness]
        roundnesses = [d["roundness"] for d in scatter_ratio_roundness]

        hist_aspect = make_histogram(aspect_ratios, bin_size=0.1)
        hist_roundness = make_histogram(roundnesses, bin_size=0.05)
            

        # Data to be returned
        data = {
            "uploads": uploads[0][0] if uploads[0][0] is not None else 0,
            "users": users[0][0] if users[0][0] is not None else 0,
            "validated": validated[0][0] if validated[0][0] is not None else 0,
            "pending": unvalidated[0][0] if unvalidated[0][0] is not None else 0,
            "bean_types": bean_type_data,
            "top_uploaders": top_uploader_data,
            "farms": farm_data,
            "scatter_ratio_roundness" : scatter_ratio_roundness,
            "hist_aspect": hist_aspect,
            "hist_roundness": hist_roundness,
            "corr_feats": corr_feats,
            "total_predictions": total_predictions[0] if total_predictions[0] is not None else 0,
            "avg_confidence": float(confidence_stats[0]) if confidence_stats[0] is not None else 0,
            "min_confidence": float(confidence_stats[1]) if confidence_stats[1] is not None else 0,
            "max_confidence": float(confidence_stats[2]) if confidence_stats[2] is not None else 0,
            "feature_stats": feature_stats_data
        }


    return JsonResponse({'data': (data)})

def make_histogram(data, bin_size):
    # Round each value to nearest bin (like 1.1, 1.2, etc.)
    bins = [round(math.floor(x / bin_size) * bin_size, 2) for x in data]
    counts = Counter(bins)
    # Turn into list of {bin, count} for Recharts
    return [{"value": b, "count": c} for b, c in sorted(counts.items())]