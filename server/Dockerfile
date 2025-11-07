# Use Debian-based Python image
FROM python:3.12-slim

# Disable .pyc files + enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for GDAL, GEOS, and PostgreSQL
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    postgresql-client \
    libpq-dev \
    build-essential \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL and GEOS library paths as environment variables
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgeos_c.so

# Set working directory
WORKDIR /app

# Copy dependency list and install Python packages
COPY requirements.txt .
COPY install_gdal.sh .

# Install GDAL Python bindings first, then other requirements
RUN pip install --upgrade pip && \
    chmod +x install_gdal.sh && \
    ./install_gdal.sh && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p /app/media/processed /app/logs /app/staticfiles

# Make start script executable
RUN chmod +x start.sh

# Railway dynamically injects PORT
EXPOSE 8000

# Health check (simplified)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/ || exit 1

# Start the application using the startup script
CMD ["./start.sh"]
