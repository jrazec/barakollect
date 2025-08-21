from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.db import transaction
from models.models import User, UserRole, Role

@api_view(['POST'])
def login_user(request):
    uiid = request.POST.get("uiid")

    try:
        users = (
            User.objects
            .filter(id=uiid)  # filter by specific user if needed
            .values(
                "id",
                "first_name",
                "last_name",
                "avatar_image",
                "registration_date",
                "is_deleted",
                "location",
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
    location = request.POST.get("location")
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
                    "location": location,
                    "username": username,
                    "is_active": True,
                },
            )
            if not created:
                # Update mutable fields on repeated signup
                user.first_name = first_name
                user.last_name = last_name
                user.location = location
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
