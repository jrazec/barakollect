# Use GDAL-enabled Ubuntu image as base for GeoDjango support
FROM ghcr.io/osgeo/gdal:ubuntu-small-3.8.0

# Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    libpq-dev \
    postgresql-client \
    build-essential \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python command
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir -r requirements.txt

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