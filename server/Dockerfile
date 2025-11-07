# Use Debian-based Python image
FROM python:3.12-slim

# Disable .pyc files + enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency list and install Python packages
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p /app/media/processed /app/logs /app/staticfiles

# Railway dynamically injects PORT
EXPOSE 8000

# Simple startup command for debugging
CMD ["python", "manage.py", "runserver", "0.0.0.0:${PORT:-8000}"]
