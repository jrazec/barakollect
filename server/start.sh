#!/bin/bash#!/bin/bash#!/bin/bash



# Railway startup script for Django + GeoDjango application

set -e

# Railway startup script for Django + GeoDjango application# Railway start script for Django application

echo "Starting Django GeoDjango application..."

set -e

# Print environment info

echo "Python version: $(python --version)"# Exit on any error

echo "Django version: $(python -c 'import django; print(django.get_version())')"

echo "Starting Django GeoDjango application..."set -e

# Check if GDAL is available

python -c "from django.contrib.gis.gdal import check; check()" && echo "GDAL is properly configured" || echo "GDAL configuration issue"



# Run migrations only if RUN_MIGRATIONS environment variable is set to "true"# Print environment infoecho "Starting Django application..."

if [ "$RUN_MIGRATIONS" = "true" ]; then

    echo "Running database migrations..."echo "Python version: $(python --version)"

    python manage.py migrate --noinput

elseecho "Django version: $(python -c 'import django; print(django.get_version())')"# Print environment info

    echo "Skipping migrations (set RUN_MIGRATIONS=true to enable)"

fiecho "Python version: $(python --version)"



# Collect static files# Check if GDAL is availableecho "Django version: $(python -c 'import django; print(django.get_version())')"

echo "Collecting static files..."

python manage.py collectstatic --noinput --clearpython -c "from django.contrib.gis.gdal import check; check()" && echo "GDAL is properly configured" || echo "GDAL configuration issue"



# Start Gunicorn server# Run migrations

echo "Starting Gunicorn server on port $PORT..."

exec gunicorn config.wsgi:application \# Run database migrationsecho "Running database migrations..."

    --bind 0.0.0.0:${PORT:-8000} \

    --workers ${WEB_CONCURRENCY:-3} \echo "Running migrations..."python manage.py migrate --noinput

    --timeout ${GUNICORN_TIMEOUT:-120} \

    --keep-alive ${GUNICORN_KEEPALIVE:-2} \python manage.py migrate --noinput

    --max-requests ${GUNICORN_MAX_REQUESTS:-1200} \

    --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER:-50} \# Collect static files

    --preload \

    --log-level info \# Collect static filesecho "Collecting static files..."

    --log-file - \

    --access-logfile - \echo "Collecting static files..."python manage.py collectstatic --noinput --clear

    --error-logfile -
python manage.py collectstatic --noinput --clear

# Start the application with Gunicorn

# Start Gunicorn with proper configuration for Railwayecho "Starting Gunicorn server..."

echo "Starting Gunicorn server on port $PORT..."exec gunicorn config.wsgi:application \

exec gunicorn config.wsgi:application \    --bind 0.0.0.0:${PORT:-8000} \

    --bind 0.0.0.0:${PORT:-8000} \    --workers ${WEB_CONCURRENCY:-3} \

    --workers ${WEB_CONCURRENCY:-3} \    --timeout ${GUNICORN_TIMEOUT:-120} \

    --timeout ${GUNICORN_TIMEOUT:-120} \    --keep-alive ${GUNICORN_KEEPALIVE:-2} \

    --keep-alive ${GUNICORN_KEEPALIVE:-2} \    --max-requests ${GUNICORN_MAX_REQUESTS:-1000} \

    --max-requests ${GUNICORN_MAX_REQUESTS:-1200} \    --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER:-50} \

    --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER:-50} \    --preload \

    --preload \    --log-level info \

    --log-level info \    --log-file - \

    --log-file - \    --access-logfile - \

    --access-logfile - \    --error-logfile -
    --error-logfile -