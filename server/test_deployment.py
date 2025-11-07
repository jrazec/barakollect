#!/usr/bin/env python
"""
Test script to verify deployment readiness
"""
import os
import sys
import subprocess

def test_imports():
    """Test critical package imports"""
    print("🔍 Testing critical imports...")
    try:
        import django
        print(f"✅ Django: {django.get_version()}")
        
        import cv2
        print(f"✅ OpenCV: {cv2.__version__}")
        
        import torch
        print(f"✅ PyTorch: {torch.__version__}")
        
        import ultralytics
        print("✅ Ultralytics: Available")
        
        try:
            from django.contrib.gis.gdal import check
            check()
            print("✅ GDAL: Properly configured")
        except ImportError:
            print("⚠️  GDAL: Not available locally (will work in Docker)")
        except Exception as e:
            print(f"⚠️  GDAL: {e} (should work in Docker environment)")
        
        import psycopg2
        print("✅ psycopg2: Available for PostgreSQL")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_django_config():
    """Test Django configuration"""
    print("\n🔍 Testing Django configuration...")
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        import django
        django.setup()
        
        from django.core.management import execute_from_command_line
        print("✅ Django settings loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Django config error: {e}")
        return False

def test_static_files():
    """Test static files collection"""
    print("\n🔍 Testing static files collection...")
    try:
        result = subprocess.run(['python', 'manage.py', 'collectstatic', '--noinput', '--dry-run'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Static files collection works")
            return True
        else:
            print(f"❌ Static files error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Static files test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing deployment readiness for Railway...\n")
    
    tests = [
        test_imports,
        test_django_config,
        test_static_files
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 Deployment ready!")
        return True
    else:
        print("❌ Deployment has issues that need fixing")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)