import email
from django.utils import timezone
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.db import transaction
from models.models import User, UserRole, Role, Location
from django.core import serializers
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
        users = (
            User.objects
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

        return JsonResponse({"data": list(map(change_to_role,list(users)))})
    except Exception as e:
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
        # Create the user auth here as well for supabase
        userAuth = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
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
            


        return JsonResponse({"message": "User created successfully", "user": user.id}, status=201)
    except Exception as e:
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
                supabase.auth.api.update_user(user.id, {"password": "123456"})
            user.save()

            role = Role.objects.get(id=int(role_id))
            UserRole.objects.update_or_create(user=user, defaults={"role": role})

        return JsonResponse({"message": "User updated successfully"})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def deactivate_user(request):
    id = request.data.get("userId")
    print(id)
    try:
        response = User.objects.filter(id=id).update(is_deleted=True)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"message": "User soft deleted successfully"})

@api_view(['POST'])
def activate_user(request):
    id = request.data.get("userId")
    try:
        response = User.objects.filter(id=id).update(is_deleted=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"message": "User activated successfully"})

@api_view(['DELETE'])
def delete_user(request, user_id):
    try:
       with transaction.atomic():
        supabase.auth.admin.delete_user(user_id)
        User.objects.filter(id=user_id).delete()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    # Log the deletion event
    
    return JsonResponse({"message": "User deleted permanently"})

@api_view(['POST'])
def test(request):
    # Get all requests from the frontend client
    requests = request.GET
    print(requests)
    return JsonResponse({"message": "Test endpoint working", "requests": requests})