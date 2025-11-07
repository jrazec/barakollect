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
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi --bind 0.0.0.0:${PORT:-8000} --log-file - --access-logfile - --error-logfile - --workers 1 --timeout 120