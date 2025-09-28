#!/bin/bash

# Script to run the cleanup command periodically
# You can add this to crontab to run every 30 seconds:
# * * * * * /path/to/this/script.sh
# * * * * * (sleep 30; /path/to/this/script.sh)

cd "$(dirname "$0")"
python manage.py cleanup_temp_images --max-age=20
