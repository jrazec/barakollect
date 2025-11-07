#!/bin/bash

# Exit on any error
set -e

echo "Starting Django application..."

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear || echo "Collectstatic failed, continuing..."

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput || echo "Migrations failed, continuing..."

# Start Gunicorn
echo "PORT environment variable: ${PORT:-8000}"
echo "Starting Gunicorn server on port ${PORT:-8000}..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --log-file - --access-logfile - --error-logfile - --workers 2 --timeout 120