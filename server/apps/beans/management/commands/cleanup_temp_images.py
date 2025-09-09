import os
import time
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Clean up temporary processed images older than specified time'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--max-age',
            type=int,
            default=20,
            help='Maximum age of files in seconds (default: 20)',
        )
    
    def handle(self, *args, **options):
        max_age = options['max_age']
        processed_folder = os.path.join(settings.MEDIA_ROOT, "processed")
        
        if not os.path.exists(processed_folder):
            self.stdout.write(self.style.WARNING('Processed folder does not exist'))
            return
        
        current_time = time.time()
        deleted_count = 0
        
        for filename in os.listdir(processed_folder):
            filepath = os.path.join(processed_folder, filename)
            
            # Skip directories
            if os.path.isdir(filepath):
                continue
            
            # Check if file is temporary (starts with temp_, debug_, calib_, processed_)
            if any(filename.startswith(prefix) for prefix in ['temp_', 'debug_', 'calib_', 'processed_']):
                file_age = current_time - os.path.getctime(filepath)
                
                if file_age > max_age:
                    try:
                        os.remove(filepath)
                        deleted_count += 1
                        self.stdout.write(f'Deleted: {filename}')
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'Failed to delete {filename}: {str(e)}')
                        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Cleanup completed. Deleted {deleted_count} files.')
        )
