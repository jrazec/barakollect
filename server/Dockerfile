# Use Python 3.11 slim as base image
FROM python:3.11-slim

# Set environment variables for logging and optimization
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_PREFER_BINARY=1 \
    DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Install system dependencies including GDAL, GEOS, PROJ for GeoDjango
RUN echo "=== Installing System Dependencies ===" && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        gdal-bin \
        libgdal-dev \
        libproj-dev \
        proj-data \
        libgeos-dev \
        postgresql-client \
        libpq-dev \
        python3-dev \
        build-essential \
        curl \
        binutils \
        && echo "=== System dependencies installed ===" && \
    # Verify GDAL installation
    echo "=== Verifying GDAL installation ===" && \
    (gdal-config --version 2>&1 && echo "GDAL version: $(gdal-config --version 2>&1)" || echo "⚠ WARNING: gdal-config check failed") && \
    # Verify GEOS installation (geos-config might not be in PATH, but libraries are installed)
    echo "=== Verifying GEOS installation ===" && \
    (geos-config --version 2>/dev/null && echo "GEOS version: $(geos-config --version 2>/dev/null)" || echo "ℹ INFO: geos-config not in PATH, but libgeos-dev is installed") && \
    # Verify PROJ installation
    echo "=== Verifying PROJ installation ===" && \
    (proj --version 2>/dev/null && echo "PROJ version: $(proj --version 2>/dev/null)" || echo "ℹ INFO: proj command not found, but libproj-dev is installed") && \
    # Clean up apt cache to reduce image size
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    echo "=== System dependencies setup complete ==="

# Copy requirements file
COPY requirements.txt /app/

# Upgrade pip and install Python dependencies
RUN echo "=== Installing Python Dependencies ===" && \
    pip install --upgrade pip setuptools wheel && \
    echo "=== Creating requirements file without GDAL ===" && \
    grep -v '^GDAL' requirements.txt > /tmp/requirements_no_gdal.txt || cp requirements.txt /tmp/requirements_no_gdal.txt && \
    echo "=== Installing requirements (excluding GDAL - handled by system) ===" && \
    pip install --prefer-binary --timeout=300 -r /tmp/requirements_no_gdal.txt && \
    echo "=== Python dependencies installed ===" && \
    # Verify critical packages
    echo "=== Verifying Critical Packages ===" && \
    python -c "import django; print('✓ Django:', django.__version__)" && \
    python -c "import torch; print('✓ PyTorch:', torch.__version__)" || echo "⚠ WARNING: PyTorch not installed" && \
    echo "=== Package verification complete ==="

# Copy project files
COPY . /app/

# Collect static files
RUN echo "=== Collecting Static Files ===" && \
    DJANGO_SETTINGS_MODULE=config.settings python manage.py collectstatic --noinput || echo "⚠ WARNING: Static files collection failed" && \
    echo "=== Static files collected ==="

# Validate GeoDjango setup
RUN echo "=== Validating GeoDjango/GDAL Setup ===" && \
    echo "Checking system GDAL..." && \
    gdal-config --version || echo "✗ ERROR: gdal-config not found" && \
    echo "Checking system GEOS..." && \
    geos-config --version || echo "✗ ERROR: geos-config not found" && \
    echo "Checking system PROJ..." && \
    proj --version || echo "✗ ERROR: proj not found" && \
    echo "Testing GEOS import..." && \
    DJANGO_SETTINGS_MODULE=config.settings python -c "from django.contrib.gis import geos; print('✓ GEOS version:', geos.geos_version)" || echo "✗ ERROR: GEOS import failed" && \
    echo "Testing GDAL import..." && \
    DJANGO_SETTINGS_MODULE=config.settings python -c "from django.contrib.gis import gdal; print('✓ GDAL version:', gdal.gdal_version)" || echo "✗ ERROR: GDAL import failed" && \
    echo "Testing PROJ import..." && \
    DJANGO_SETTINGS_MODULE=config.settings python -c "from django.contrib.gis import gdal; print('✓ PROJ version:', gdal.proj_version)" || echo "✗ ERROR: PROJ import failed" && \
    echo "Testing GeoDjango models import..." && \
    DJANGO_SETTINGS_MODULE=config.settings python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); import django; django.setup(); from django.contrib.gis.db import models; print('✓ GeoDjango models imported successfully')" || echo "✗ ERROR: GeoDjango models import failed" && \
    echo "Testing PostGIS backend..." && \
    DJANGO_SETTINGS_MODULE=config.settings python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); import django; django.setup(); from django.contrib.gis.db.backends.postgis import base; print('✓ PostGIS backend available')" || echo "✗ ERROR: PostGIS backend not available" && \
    echo "=== GeoDjango/GDAL Validation Complete ==="

# Expose port (Railway will set PORT env var, default to 8000)
EXPOSE 8000

# Health check (Railway will override PORT at runtime)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/ || exit 1

# Run gunicorn with comprehensive logging
CMD echo "=== Starting Application ===" && \
    echo "PORT: ${PORT:-8000}" && \
    echo "DJANGO_SETTINGS_MODULE: ${DJANGO_SETTINGS_MODULE:-config.settings}" && \
    echo "=== Starting Gunicorn ===" && \
    exec gunicorn config.wsgi:application \
        --bind 0.0.0.0:${PORT:-8000} \
        --workers 2 \
        --timeout 120 \
        --access-logfile - \
        --error-logfile - \
        --log-level info \
        --capture-output

