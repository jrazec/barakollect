# Use GDAL-enabled Ubuntu image as base for GeoDjango support# Use GDAL-enabled Ubuntu image as base for GeoDjango support# Use Debian-based Python image

FROM ghcr.io/osgeo/gdal:ubuntu-small-3.8.0

FROM ghcr.io/osgeo/gdal:ubuntu-small-3.8.0FROM python:3.12-slim

# Set environment variables for Python

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

ENV DEBIAN_FRONTEND=noninteractive# Set environment variables for Python# Disable .pyc files + enable unbuffered logs



# Install system dependenciesENV PYTHONDONTWRITEBYTECODE=1ENV PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y \

    python3 \ENV PYTHONUNBUFFERED=1ENV PYTHONUNBUFFERED=1

    python3-pip \

    python3-dev \ENV DEBIAN_FRONTEND=noninteractive

    python3-venv \

    libpq-dev \# Install system dependencies for PostgreSQL

    postgresql-client \

    build-essential \# Install system dependenciesRUN apt-get update && apt-get install -y \

    curl \

    && rm -rf /var/lib/apt/lists/*RUN apt-get update && apt-get install -y \    postgresql-client \



# Create symlink for python command    python3 \    libpq-dev \

RUN ln -sf /usr/bin/python3 /usr/bin/python

    python3-pip \    build-essential \

# Set working directory

WORKDIR /app    python3-dev \    pkg-config \



# Copy requirements first for better Docker layer caching    python3-venv \    curl \

COPY requirements.txt .

    libpq-dev \    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies

RUN pip3 install --upgrade pip && \    postgresql-client \

    pip3 install --no-cache-dir -r requirements.txt

    build-essential \# Set working directory

# Copy project files

COPY . .    curl \WORKDIR /app



# Create necessary directories    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/staticfiles /app/media /app/logs

# Copy dependency list and install Python packages

# Collect static files (but don't run migrations automatically)

RUN python manage.py collectstatic --noinput --clear# Create symlink for python commandCOPY requirements.txt .



# Make any shell scripts executableRUN ln -sf /usr/bin/python3 /usr/bin/python

RUN find . -name "*.sh" -exec chmod +x {} \;

# Install Python requirements

# Expose port 8000

EXPOSE 8000# Set working directoryRUN pip install --upgrade pip && \



# Health checkWORKDIR /app    pip install --no-cache-dir -r requirements.txt

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \

    CMD curl -f http://localhost:8000/ || exit 1



# Start command - no automatic migrations# Copy requirements first for better Docker layer caching# Copy project files

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
COPY requirements.txt .COPY . .



# Install Python dependencies# Create necessary directories

RUN pip3 install --upgrade pip && \RUN mkdir -p /app/media/processed /app/logs /app/staticfiles

    pip3 install --no-cache-dir -r requirements.txt

# Make scripts executable (if they exist)

# Copy project filesRUN if [ -f start.sh ]; then chmod +x start.sh; fi

COPY . .RUN if [ -f cleanup_temp_images.sh ]; then chmod +x cleanup_temp_images.sh; fi



# Create necessary directories# Railway dynamically injects PORT

RUN mkdir -p /app/staticfiles /app/media /app/logsEXPOSE $PORT

EXPOSE 8000

# Collect static files

RUN python manage.py collectstatic --noinput --clear# Health check (simplified for Railway)

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \

# Make any shell scripts executable    CMD curl -f http://localhost:${PORT:-8000}/api/ || exit 1

RUN find . -name "*.sh" -exec chmod +x {} \;

# Start the application using the startup script

# Expose port 8000CMD ["./start.sh"]

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start command will be defined in railway.json
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]