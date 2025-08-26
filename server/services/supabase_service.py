from supabase import create_client
from django.conf import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def signup_user(email: str, password: str):
    return supabase.auth.sign_up({
        "email": email,
        "password": password,
    })
