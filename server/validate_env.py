#!/usr/bin/env python3
"""
Environment validation script for Railway deployment
"""
import os
import sys

required_vars = [
    'SECRET_KEY',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD', 
    'DB_HOST',
    'DB_PORT'
]

optional_vars = [
    'DEBUG',
    'PORT',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'SUPABASE_ROLE_KEY'
]

def validate_env():
    print("🔍 Validating environment variables...")
    
    missing_required = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_required.append(var)
        else:
            print(f"✅ {var}: {'*' * len(value[:10])}...")
    
    if missing_required:
        print(f"❌ Missing required environment variables: {', '.join(missing_required)}")
        return False
    
    print("📝 Optional variables:")
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * len(value[:10])}...")
        else:
            print(f"⚠️  {var}: not set")
    
    # Test database connection
    try:
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        django.setup()
        
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    print("✅ All environment validations passed!")
    return True

if __name__ == "__main__":
    if not validate_env():
        sys.exit(1)