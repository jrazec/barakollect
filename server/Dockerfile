# Use Debian-based Python image
FROM python:3.12-slim

# Disable .pyc files + enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for GDAL and GEOS
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Dynamically detect and set GDAL and GEOS library paths
RUN echo "export GDAL_LIBRARY_PATH=$(ldconfig -p | grep libgdal | head -n1 | awk '{print $4}')" >> /etc/environment && \
    echo "export GEOS_LIBRARY_PATH=$(ldconfig -p | grep libgeos_c | head -n1 | awk '{print $4}')" >> /etc/environment

# Set working directory
WORKDIR /app

# Copy dependency list and install Python packages
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files (ignore if not using Django staticfiles)
RUN python manage.py collectstatic --noinput || true

# Railway dynamically injects PORT
EXPOSE 8000
CMD bash -c "source /etc/environment && gunicorn barakcollect.wsgi:application --bind 0.0.0.0:${PORT:-8000}"
