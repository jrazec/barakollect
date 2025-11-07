#!/bin/bash

# Startup script for Django application
set -e  # Exit on any error

echo "Starting Django application..."

# Validate environment variables
echo "Validating environment variables..."
python validate_env.py
if [ $? -ne 0 ]; then
    echo "❌ Environment validation failed"
    exit 1
fi

# Wait for database to be ready (if using external database)
echo "Checking database connection..."
python -c "
import os
import django
import sys
from django.db import connection
from django.core.management.color import no_style
style = no_style()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

try:
    connection.cursor()
    print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
    sys.exit(1)
"

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Start the application
echo "Starting gunicorn server on port ${PORT:-8000}..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --log-level info \
    --access-logfile - \
    --error-logfile -