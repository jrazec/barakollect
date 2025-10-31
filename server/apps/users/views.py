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
        
        # Build the base queryset
        users_query = User.objects.all()
        
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
            "userrole__role__name",  
        ).order_by('-registration_date')  # Order by registration date descending
        
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
def test(request):
    # Get all requests from the frontend client
    requests = request.GET
    print(requests)
    return JsonResponse({"message": "Test endpoint working", "requests": requests})