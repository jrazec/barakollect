# Railway Deployment Guide for Django + GeoDjango

This project is configured for automatic deployment to Railway using Docker with full GeoDjango support.

## 🚀 Quick Deployment

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add Docker + Railway setup for GeoDjango"
   git push
   ```

2. **Railway will automatically detect and deploy using the Dockerfile**

## 🔧 Configuration Files

### Core Files
- `Dockerfile` - GDAL-enabled Ubuntu image with GeoDjango support
- `railway.json` - Railway deployment configuration
- `start.sh` - Production startup script
- `.dockerignore` - Optimizes Docker build

### Environment Variables (Set in Railway Dashboard)

**Required:**
```env
SECRET_KEY=your-django-secret-key
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

**Optional (with defaults):**
```env
DEBUG=False
WEB_CONCURRENCY=3
PORT=8000
DJANGO_SETTINGS_MODULE=config.settings
```

**Database-specific:**
```env
DB_NAME=your_db_name
DB_USER=your_db_user  
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
```

**Other services:**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SUPABASE_ROLE_KEY=your-supabase-role-key
```

## 🗄️ Database Setup

This project uses **PostGIS** (PostgreSQL with spatial extensions). Railway provides PostGIS databases:

1. Add a PostgreSQL service in Railway
2. Enable PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS postgis_topology;
   ```

## 🏗️ Build Process

The deployment automatically:
1. Uses GDAL-enabled base image
2. Installs Python dependencies
3. Collects static files
4. Runs database migrations
5. Starts Gunicorn server

## 🔍 Troubleshooting

**GDAL Issues:**
- The Docker image includes GDAL, GEOS, and PROJ libraries
- Check logs for "GDAL is properly configured" message

**Database Connection:**
- Ensure PostGIS extensions are installed
- Verify DATABASE_URL format
- Check firewall/SSL settings

**Static Files:**
- Files are collected automatically during build
- Served by Django in development, configure CDN for production

## 📁 Project Structure

```
server/
├── Dockerfile              # Docker configuration
├── railway.json           # Railway deployment config
├── start.sh              # Production startup script
├── .dockerignore         # Docker build optimization
├── config/              
│   ├── settings.py       # Django settings (with GeoDjango)
│   └── wsgi.py          # WSGI application
├── models/
│   └── models.py        # GeoDjango models with PointField
└── requirements.txt     # Python dependencies
```

## 🌍 GeoDjango Features Supported

- ✅ PostGIS backend
- ✅ GDAL library for spatial data
- ✅ GEOS for geometric operations  
- ✅ PROJ for coordinate transformations
- ✅ Spatial database functions
- ✅ GeoJSON serialization
- ✅ Admin interface for spatial data

## 📊 Production Considerations

- **Scaling:** Adjust `WEB_CONCURRENCY` based on traffic
- **Monitoring:** Use Railway's built-in logs and metrics
- **Security:** Environment variables for sensitive data
- **Performance:** Consider CDN for static/media files
- **Backup:** Regular database backups recommended