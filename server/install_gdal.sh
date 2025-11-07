#!/bin/bash

# Install GDAL Python bindings with proper configuration
echo "Installing GDAL Python bindings..."

# Get GDAL version
GDAL_VERSION=$(gdal-config --version)
echo "GDAL version: $GDAL_VERSION"

# Set environment variables for GDAL compilation
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
export GDAL_CONFIG=/usr/bin/gdal-config

# Install GDAL Python package
pip install --no-cache-dir GDAL==$GDAL_VERSION

echo "GDAL Python bindings installed successfully!"