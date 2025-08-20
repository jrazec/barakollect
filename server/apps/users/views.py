from django.http import JsonResponse
from rest_framework.decorators import api_view
from models.models import User

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
