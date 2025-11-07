# Use Debian-based Python image
FROM python:3.12-slim

# Disable .pyc files + enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    build-essential \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency list and install Python packages
COPY requirements.txt .

# Install Python requirements
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p /app/media/processed /app/logs /app/staticfiles

# Make scripts executable (if they exist)
RUN if [ -f start.sh ]; then chmod +x start.sh; fi
RUN if [ -f cleanup_temp_images.sh ]; then chmod +x cleanup_temp_images.sh; fi

# Railway dynamically injects PORT
EXPOSE $PORT
EXPOSE 8000

# Health check (simplified for Railway)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/ || exit 1

# Start the application using the startup script
CMD ["./start.sh"]
