from django.shortcuts import render
from django.utils import timezone
from django.http import JsonResponse
from django.core.paginator import Paginator
from rest_framework.decorators import api_view
from django.db import transaction
from models.models import Image, User, UserRole, Role, Location
from django.core import serializers
from services.activity_logger import log_user_activity
from services.supabase_service import supabase
# import cursor from django.db.connection
from django.db import connection
from django.db.models import F

# USER SIGNUP AND LOGIN
@api_view(['POST'])
def login_user(request):
    uiid = request.POST.get("uiid")

    try:
        users = (
            User.objects
            .filter(id=uiid, is_deleted=False)  # filter by specific user if needed
            .values(
                "id",
                "first_name",
                "last_name",
                "avatar_image",
                "registration_date",
                "is_deleted",
                "location_id",
                "location__name",
                "username",
                "last_login",
                "is_active",
                "userrole__role__name",  
            )
        )
        # check if userrole__role_name == 'admin', if so, create activity log for admin login

        # user = users.first()
        # if user.get("userrole__role__name") == "admin":
        #     log_user_activity(
        #         user_id=uiid,
        #         action="LOGIN",
        #         details="Admin login attempt was successful.",
        #         resource="N/A",
        #         status="success"
        #     )

        if not users.exists():
            return JsonResponse({"error": "Cannot find user"}, status=404)

        return JsonResponse({"data": list(users)}, safe=False)

    except Exception as e:
        
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
def signup_user(request):
    uiid = request.POST.get("uiid")
    first_name = request.POST.get("first_name")
    last_name = request.POST.get("last_name")
    location_id = request.POST.get("location_id")
    username = request.POST.get("username")

    role_id = request.POST.get("role_id")

    if not all([uiid, first_name, last_name, username, role_id]):
        return JsonResponse({"error": "Missing required fields"}, status=400)

    try:
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                id=uiid,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "location_id": location_id,
                    "username": username,
                    "is_active": True,
                },
            )
            if not created:
                # Update mutable fields on repeated signup
                user.first_name = first_name
                user.last_name = last_name
                user.location_id = location_id
                user.username = username
                user.save()

            # Ensure the user has a default role (e.g., researcher)
            # Use requested role id if exists, else fallback to researcher (id 2)
            try:
                role = Role.objects.get(id=int(role_id))
            except Role.DoesNotExist:
                role = Role.objects.get(name="researcher")

            UserRole.objects.get_or_create(user=user, role=role)
            log_user_activity(
                user_id=uiid,
                action="CREATE",
                details="User signup successful.",
                resource=f"User {user.id}",
                status="success"
            )

        return JsonResponse({"message": "Signup successful", "role": role.name})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# USER MANAGEMENT

def change_to_role(list):
    list["role"] = list.pop("userrole__role__name", None)
    return list

@api_view(['GET'])
def get_users(req):
    try:
        # Get pagination and search parameters
        page = int(req.GET.get('page', 1))
        limit = int(req.GET.get('limit', 10))
        search_username = req.GET.get('search_username', '').strip()
        role_filter = req.GET.get('role', '').strip()
        location_filter = req.GET.get('location', '').strip()
        

        
        
        print(f"DEBUG: get_users - page={page}, limit={limit}, search_username={search_username}, role_filter={role_filter}, location_filter={location_filter}")
        
        # Build the base queryset, merge to auth.users and get the email
        users_query = User.objects.all()
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, email FROM auth.users
            """)
            auth_users = cursor.fetchall()
            auth_user_dict = {str(row[0]): row[1] for row in auth_users}
            print(f"DEBUG: Auth users fetched: {auth_user_dict}")
        
        
        

        # Do not include user with username 'barakollect'
        users_query = users_query.exclude(username='barakollect')
        # Apply search filter for username
        if search_username:
            users_query = users_query.filter(username__icontains=search_username)
        
        # Apply role filter
        if role_filter and role_filter != 'all':
            users_query = users_query.filter(userrole__role__name=role_filter)
        
        # Apply location filter
        if location_filter and location_filter != 'all':
            users_query = users_query.filter(location_id=location_filter)
        
        # Get the values with all required fields
        users_data = users_query.values(
            "id",
            "first_name",
            "last_name",
            "avatar_image",
            "registration_date",
            "is_deleted",
            "location_id",
            "location__name",
            "username",
            "last_login",
            "is_active",
            "userrole__role__name"
        ).order_by('-registration_date')  # Order by registration date descending
        
        # for each user in users_data add an email field from auth_user_dict that is mapped by id
        for user in users_data:
            user_id_str = str(user['id'])
            user['email'] = auth_user_dict.get(user_id_str, '')
        # Apply pagination using Django's Paginator
        paginator = Paginator(users_data, limit)
        
        try:
            paginated_users = paginator.page(page)
        except Exception as e:
            print(f"DEBUG: Pagination error: {str(e)}")
            # If page is out of range, return the last page
            paginated_users = paginator.page(paginator.num_pages)
        
        # Transform the data
        users_list = list(map(change_to_role, list(paginated_users)))
        
        print(f"DEBUG: get_users - returning {len(users_list)} users, page {paginated_users.number} of {paginator.num_pages}")
        
        return JsonResponse({
            "data": users_list,
            "pagination": {
                "currentPage": paginated_users.number,
                "totalPages": paginator.num_pages,
                "totalItems": paginator.count,
                "itemsPerPage": limit,
                "hasNext": paginated_users.has_next(),
                "hasPrevious": paginated_users.has_previous()
            }
        })
    except Exception as e:
        print(f"DEBUG: Error in get_users: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
def get_profile(request):
    """Return a single user's profile combined with auth.email from auth.users table.
    Also includes locations list and system settings for admin users.

    Expects query param `userId`.
    """
    user_id = request.GET.get('userId')
    if not user_id:
        return JsonResponse({"error": "Missing userId parameter"}, status=400)

    try:
        user_qs = User.objects.filter(id=user_id).values(
            "id",
            "first_name",
            "last_name",
            "avatar_image",
            "registration_date",
            "is_deleted",
            "location_id",
            "location__name",
            "username",
            "last_login",
            "is_active",
            "userrole__role__name",
        )

        if not user_qs.exists():
            return JsonResponse({"error": "User not found"}, status=404)

        user = list(user_qs)[0]

        # fetch email from auth.users in Supabase
        with connection.cursor() as cursor:
            cursor.execute("SELECT email FROM auth.users WHERE id = %s", [str(user_id)])
            row = cursor.fetchone()
            user_email = row[0] if row else ""

        user['email'] = user_email
        # normalize role field name
        user['role'] = user.pop('userrole__role__name', None)

        # Get all locations for dropdown
        locations = list(Location.objects.values('id', 'name'))
        user['locations'] = locations
        
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
        # Add system settings (default values for now)
        user['system_settings'] = system_settings

        return JsonResponse({"data": user})
    except Exception as e:
        print(f"DEBUG: Error in get_profile: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
def update_profile(request):
    """Update profile fields in local User model and update Supabase auth when email/password changes.

    Expects JSON body with at least 'id'. Optional fields: first_name, last_name, username, location_id, email, new_password, old_password
    For system settings: save_images, accept_predictions, max_images
    """
    user_id = request.data.get('id')
    if not user_id:
        return JsonResponse({"error": "Missing user id"}, status=400)

    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    username = request.data.get('username')
    location_id = request.data.get('location_id')
    new_email = request.data.get('email')
    new_password = request.data.get('new_password')
    old_password = request.data.get('old_password')
    
    # System settings
    save_images = request.data.get('save_images')
    accept_predictions = request.data.get('accept_predictions')
    max_images = request.data.get('max_images')

    try:
        with transaction.atomic():
            user = User.objects.get(id=user_id)

            # If changing password, validate old password first
            if new_password and old_password:
                try:
                   #check the old password is correct 
                    user_data = supabase.auth.admin.get_user_by_id(user_id)
                    email = user_data.user.email
                    print(f"DEBUG: Validating old password for user {user_id} with email {email}")
                    # Validate old password with supabase auth
                    auth_response = supabase.auth.sign_in_with_password({
                        "email": email,
                        "password": old_password
                    })
                    print(f"DEBUG: Auth response for old password validation: {auth_response.user.id}")
                    if not auth_response.user:
                        return JsonResponse({"error": "Old password is incorrect"}, status=400)
                except Exception as e:
                    return JsonResponse({"error": "Old password is incorrect"}, status=400)

            if first_name is not None:
                user.first_name = first_name
            if last_name is not None:
                user.last_name = last_name
            if username is not None:
                user.username = username
            if location_id is not None:
                user.location = Location(id=location_id)

            # Update supabase auth if email or password is provided
            supabase_payload = {}
            if new_email:
                supabase_payload['email'] = new_email
            if new_password:
                supabase_payload['password'] = new_password

            if supabase_payload:
                try:
                    # use admin update to modify auth user
                    # supabase client here exposes admin API elsewhere in the repo
                    res = supabase.auth.admin.update_user_by_id(user_id, supabase_payload)
                    print(f"DEBUG: Supabase auth update response: {res}")
                    log_user_activity(
                        user_id=user_id,
                        action="UPDATE",
                        details="Supabase auth updated for user profile change.",
                        resource=f"User {user_id}",
                        status="success"
                    )
                except Exception as e:
                    # log but continue with local update (partial success)
                    log_user_activity(
                        user_id=user_id,
                        action="UPDATE",
                        details=f"Supabase auth update failed: {str(e)}",
                        resource=f"User {user_id}",
                        status="partial_success"
                    )
                    print(f"Warning: Failed to update supabase auth for user {user_id}: {str(e)}")

            # Handle system settings updates (temporary print statements)
            if save_images is not None:
                print(f"System setting 'save_images' changed to: {save_images}")
                #Update the plans table using cursor
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE public.plans
                        SET save_image = %s
                    """, [save_images])
                    print(f"DEBUG: Updated 'save_images' {save_images}")

                
                log_user_activity(
                    user_id=user_id,
                    action="UPDATE",
                    details=f"System setting 'save_images' changed to: {save_images}",
                    resource=f"System Settings",
                    status="success"
                )
            
            if accept_predictions is not None:
                print(f"System setting 'accept_predictions' changed to: {accept_predictions}")
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE public.plans
                        SET accept_predictions = %s
                    """, [accept_predictions])
                    print(f"DEBUG: Updated 'accept_predictions' {accept_predictions}")
                    
                log_user_activity(
                    user_id=user_id,
                    action="UPDATE",
                    details=f"System setting 'accept_predictions' changed to: {accept_predictions}",
                    resource=f"System Settings",
                    status="success"
                )
            
            if max_images is not None:
                print(f"System setting 'max_images' changed to: {max_images}")
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE public.plans
                        SET image_accepted_count = %s
                    """, [max_images])
                    print(f"DEBUG: Updated 'max_images' {max_images}")
                log_user_activity(
                    user_id=user_id,
                    action="UPDATE",
                    details=f"System setting 'max_images' changed to: {max_images}",
                    resource=f"System Settings",
                    status="success"
                )

            user.save()

            # Return the updated profile
            with connection.cursor() as cursor:
                cursor.execute("SELECT email FROM auth.users WHERE id = %s", [str(user_id)])
                row = cursor.fetchone()
                user_email = row[0] if row else (new_email or "")

            result = {
                "id": str(user.id),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "location_id": user.location_id,
                "location__name": user.location.name if user.location else None,
                "email": user_email,
            }

            log_user_activity(
                user_id=user_id,
                action="UPDATE",
                details=f"User profile updated: {user_id}",
                resource=f"User {user_id}",
                status="success"
            )

            return JsonResponse({"message": "Profile updated successfully", "data": result})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        print(f"DEBUG: Error in update_profile: {str(e)}")
        log_user_activity(
            user_id=user_id,
            action="UPDATE",
            details=f"User profile update failed: {str(e)}",
            resource=f"User {user_id}",
            status="failed"
        )
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
def create_user(request):
    first_name = request.data.get("first_name")
    email = request.data.get("email")
    password = request.data.get("password")
    last_name = request.data.get("last_name")
    location_id = request.data.get("location_id")
    username = request.data.get("username")
    role = request.data.get("role")
    role_id = 3 # temp is farmer

    if role == "farmer":
        role_id = 3
    elif role == "researcher":
        role_id = 2
    elif role == "admin":
        role_id = 1

    try:
        # Create the user auth here as well for supabases
        userAuth = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
       
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    print(email,password)
    print(userAuth)
    uiid = userAuth.user.id
    
    if not all([uiid, first_name, last_name, username, role_id]):
        return JsonResponse({"error": "Missing required fields"}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create(
                id=uiid,
                first_name=first_name,
                last_name=last_name,
                location=Location(id=location_id) if location_id else None,
                username=username,
                is_active=True,
                registration_date=timezone.now()
            )

            role = Role.objects.get(id=int(role_id))
            UserRole.objects.create(user=user, role=role)
            log_user_activity(
                user_id=userAuth.user.id,
                action="CREATE",
                details="User account created in Supabase auth.",
                resource=f"User {userAuth.user.id}",
                status="success"
            )


        return JsonResponse({"message": "User created successfully", "user": user.id}, status=201)
    except Exception as e:
        log_user_activity(
            user_id=userAuth.user.id,
            action="CREATE",
            details=f"User account creation failed in Supabase auth; Error: {str(e)}",
            resource=f"User {userAuth.user.id}",
            status="failed"
        )
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def update_user(request):
    user_id = request.data.get("id")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    location_id = request.data.get("location_id")
    username = request.data.get("username")
    role = request.data.get("role")
    reset_password = request.data.get("resetPassword")

    role_id = 3 # temp is farmer

    if role == "3":
        role_id = 3
    elif role == "2":
        role_id = 2
    elif role == "1":
        role_id = 1
    if not all([user_id, first_name, last_name, username, role]):
        return JsonResponse({"error": "Missing required fields"}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.get(id=user_id)
            user.first_name = first_name
            user.last_name = last_name
            user.location_id = location_id
            user.username = username
            if reset_password == 'true':
                # Reset password to "123456" in Supabase
                supabase.auth.update_user(user.id, {"password": "123456"})
            user.save()

            role = Role.objects.get(id=int(role_id))
            UserRole.objects.update_or_create(user=user, defaults={"role": role})
            # update user image's location if location changed
            images = Image.objects.filter(userimage__user_id=user.id)
            for img in images:
                img.location_id = location_id
                img.save()
            log_user_activity(
                user_id=user.id,
                action="UPDATE",
                details=f"User information updated: {user_id} {first_name} {last_name} {username} {location_id} {role}",
                resource=f"User {user.id}",
                status="success"
            )

        return JsonResponse({"message": "User updated successfully"})
    except User.DoesNotExist:
        log_user_activity(
            user_id=None,
            action="UPDATE",
            details=f"User not found: {user_id}",
            resource=f"User {None}",
            status="failed"
        )
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        log_user_activity(
            user_id=user_id,
            action="UPDATE",
            details=f"User update failed: {str(e)}",
            resource=f"User {user_id}",
            status="failed"
        )
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def deactivate_user(request):
    id = request.data.get("userId")
    print(id)
    try:
        response = User.objects.filter(id=id).update(is_deleted=True)
    except Exception as e:
        log_user_activity(
            user_id=id,
            action="DEACTIVATE",
            details=f"User deactivation failed: {str(e)}",
            resource=f"User {id}",
            status="failed"
        )
        return JsonResponse({"error": str(e)}, status=500)
    log_user_activity(
        user_id=id,
        action="DEACTIVATE",
        details="User soft deleted.",
        resource=f"User {id}",
        status="success"
    )
    return JsonResponse({"message": "User soft deleted successfully"})

@api_view(['POST'])
def activate_user(request):
    id = request.data.get("userId")
    try:
        response = User.objects.filter(id=id).update(is_deleted=False)
        log_user_activity(
            user_id=id,
            action="ACTIVATE",
            details="User activated.",
            resource=f"User {id}",
            status="success"
        )
    except Exception as e:
        log_user_activity(
            user_id=id,
            action="ACTIVATE",
            details=f"User activation failed: {str(e)}",
            resource=f"User {id}",
            status="failed"
        )
        return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"message": "User activated successfully"})

@api_view(['DELETE'])
def delete_user(request, user_id):
    try:
        print(f"Starting permanent deletion for user_id: {user_id}")
        with transaction.atomic():
            User.objects.filter(id=user_id).delete()
            print(f"Successfully deleted user from database: {user_id}")

            try:
                supabase.auth.admin.delete_user(user_id)
                print(f"Successfully deleted user from Supabase auth: {user_id}")
                log_user_activity(
                    user_id=user_id,
                    action="DELETE",
                    details="User permanently deleted from database and Supabase auth.",
                    resource=f"User {user_id}",
                    status="success"
                )
            except Exception as supabase_error:
                log_user_activity(
                    user_id=user_id,
                    action="DELETE",
                    details=f"User deleted from database but failed to delete from Supabase auth; Error: {str(supabase_error)}",
                    resource=f"User {user_id}",
                    status="partial_success"
                )
                print(f"Warning: Failed to delete user from Supabase auth: {str(supabase_error)}")
                # Continue execution - database deletion was successful
            
            print(f"Deleting user from database: {user_id}")
            
    except Exception as e:
        print(f"Error deleting user {user_id}: {str(e)}")
        log_user_activity(
            user_id=user_id,
            action="DELETE",
            details=f"User permanent deletion failed: {str(e)}",
            resource=f"User {user_id}",
            status="failed"
        )
        return JsonResponse({"error": str(e)}, status=500)
    # Log the deletion even
    print(f"User {user_id} deleted permanently")
    
    return JsonResponse({"message": "User deleted permanently"})

@api_view(['POST'])
def send_password_reset_email(request):
    """Send password reset email using Supabase auth.
    
    Expects JSON body with 'user_id'.
    """
    user_id = request.data.get('user_id')
    if not user_id:
        return JsonResponse({"error": "Missing user_id"}, status=400)

    try:
        # Get user's email from Supabase auth.users
        with connection.cursor() as cursor:
            cursor.execute("SELECT email FROM auth.users WHERE id = %s", [user_id])
            result = cursor.fetchone()
            
        if not result:
            return JsonResponse({"error": "User not found"}, status=404)
            
        user_email = result[0]
        
        # Send password reset email via Supabase
        reset_response = supabase.auth.admin.generate_link({
            "type": "recovery",
            "email": user_email,
            "options": {
                "redirect_to": f"{request.build_absolute_uri('/')[:-1]}/reset-password"
            }
        })
        
        if reset_response:
            log_user_activity(
                user_id=user_id,
                action="PASSWORD_RESET_REQUEST",
                details=f"Password reset email sent to {user_email}",
                resource=f"User {user_id}",
                status="success"
            )
            return JsonResponse({
                "message": "Password reset email sent successfully",
                "email": user_email
            })
        else:
            return JsonResponse({"error": "Failed to send reset email"}, status=500)
            
    except Exception as e:
        print(f"DEBUG: Error in send_password_reset_email: {str(e)}")
        log_user_activity(
            user_id=user_id,
            action="PASSWORD_RESET_REQUEST", 
            details=f"Password reset email failed: {str(e)}",
            resource=f"User {user_id}",
            status="failed"
        )
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
def get_system_info(request):
    """Get system information including database size statistics for admin dashboard."""
    try:
        with connection.cursor() as cursor:
            # DB SIZE with 500mb limit on free plan while in pro 8gb
            db_size_distribution_stats = """
            SELECT relname AS table_name,
                pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
                n_live_tup AS estimated_rows
            FROM pg_stat_user_tables
            ORDER BY pg_total_relation_size(relid) DESC;
            """
            total_db_size = """
            SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;
            """

            # IMG Bucket Size 1GB limit on free plan pro 100GB
            image_bucket_stats = """
            SELECT bucket_id,
                COUNT(*) AS file_count,
                SUM( (metadata->>'size')::bigint ) AS total_bytes,
                pg_size_pretty( SUM( (metadata->>'size')::bigint ) ) AS total_size
            FROM storage.objects
            GROUP BY bucket_id
            ORDER BY total_bytes DESC;
            """

            cursor.execute(db_size_distribution_stats)
            db_tables = cursor.fetchall()
            
            cursor.execute(total_db_size)
            total_db = cursor.fetchone()
            
            try:
                cursor.execute(image_bucket_stats)
                img_buckets = cursor.fetchall()
            except Exception as e:
                print(f"Warning: Could not fetch image bucket stats: {str(e)}")
                img_buckets = []

            # Format table data for frontend
            tables_data = []
            for table_name, size_str, rows in db_tables:
                tables_data.append({
                    'table_name': table_name,
                    'size': size_str,
                    'estimated_rows': rows or 0
                })

            # Format bucket data
            buckets_data = []
            for bucket_id, file_count, total_bytes, total_size in img_buckets:
                buckets_data.append({
                    'bucket_id': bucket_id,
                    'file_count': file_count,
                    'total_bytes': total_bytes,
                    'total_size': total_size
                })

            result = {
                'database': {
                    'total_size': total_db[0] if total_db else '0 MB',
                    'tables': tables_data
                },
                'storage': {
                    'buckets': buckets_data
                }
            }

            return JsonResponse({"data": result})
    except Exception as e:
        print(f"DEBUG: Error in get_system_info: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['POST'])
def test(request):
    # Get all requests from the frontend client
    requests = request.GET
    print(requests)
    return JsonResponse({"message": "Test endpoint working", "requests": requests})