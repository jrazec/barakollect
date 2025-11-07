# syntax=docker/dockerfile:1
FROM python:3.12-slim

# Prevents Python from writing .pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system-level dependencies for PostGIS support
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency file and install
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy your project files into the container
COPY . .

# Collect static files (optional but recommended for prod)
RUN python manage.py collectstatic --noinput

# Expose port (for local info only — Railway sets $PORT automatically)
EXPOSE 8000

# Start Gunicorn server using your Django project’s WSGI
CMD ["gunicorn", "barakcollect.wsgi:application", "--bind", "0.0.0.0:${PORT:-8000}"]
