#!/bin/bash

# Railway startup script for Django + GeoDjango application
set -e

echo "Starting Django GeoDjango application..."

# Print environment info
echo "Python version: $(python --version)"
echo "Django version: $(python -c 'import django; print(django.get_version())')"

# Check if GDAL is available
python -c "from django.contrib.gis.gdal import check; check()" && echo "GDAL is properly configured" || echo "GDAL configuration issue"

# Run migrations only if RUN_MIGRATIONS environment variable is set to "true"
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    python manage.py migrate --noinput
else
    echo "Skipping migrations (set RUN_MIGRATIONS=true to enable)"
fi

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Start Gunicorn server
echo "Starting Gunicorn server on port $PORT..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers ${WEB_CONCURRENCY:-3} \
    --timeout ${GUNICORN_TIMEOUT:-120} \
    --keep-alive ${GUNICORN_KEEPALIVE:-2} \
    --max-requests ${GUNICORN_MAX_REQUESTS:-1200} \
    --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER:-50} \
    --preload \
    --log-level info \
    --log-file - \
    --access-logfile - \
    --error-logfile -