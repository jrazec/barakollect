#!/bin/bash

# Manual migration script for Railway
# Run this only when you want to create/update database schema

echo "🔄 Running Django migrations..."

# Show what migrations would be applied
echo "📋 Planned migrations:"
python manage.py showmigrations --plan

echo ""
read -p "❓ Do you want to apply these migrations? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Applying migrations..."
    python manage.py migrate --noinput
    
    echo "📊 Current migration status:"
    python manage.py showmigrations
    
    echo "✨ Migrations completed!"
else
    echo "❌ Migrations cancelled."
fi