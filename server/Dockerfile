# Use Python 3.11 base image for better package compatibility
FROM python:3.11-slim

# Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies including GDAL
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    binutils \
    libproj-dev \
    libpq-dev \
    postgresql-client \
    build-essential \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL environment variables
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgeos_c.so

# Set working directory
WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media/processed /app/logs

# Make scripts executable (if they exist)
RUN if [ -f start.sh ]; then chmod +x start.sh; fi
RUN if [ -f cleanup_temp_images.sh ]; then chmod +x cleanup_temp_images.sh; fi

# Collect static files (but don't run migrations automatically)
RUN python manage.py collectstatic --noinput --clear

# Expose port 8000 (Railway will override with $PORT)
EXPOSE 8000

# Health check (simplified for Railway)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/ || exit 1

# Start the application using the startup script
CMD ["./start.sh"]