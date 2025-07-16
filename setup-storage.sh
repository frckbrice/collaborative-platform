#!/bin/bash

# Setup script for Supabase storage buckets
# This script helps set up the required storage buckets for the real-time collaborative platform

echo "🚀 Setting up Supabase storage buckets..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Supabase containers are running
if ! docker ps | grep -q "supabase-storage"; then
    echo "❌ Supabase storage container is not running."
    echo "Please start your Supabase services first:"
    echo "  docker-compose up -d"
    exit 1
fi

echo "✅ Supabase storage is running"

# Execute the storage setup SQL
echo "📦 Creating storage buckets..."

# Get the database container name
DB_CONTAINER=$(docker ps --filter "name=supabase-db" --format "{{.Names}}")

if [ -z "$DB_CONTAINER" ]; then
    echo "❌ Could not find Supabase database container"
    exit 1
fi

# Execute the SQL script
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres < setup-storage-buckets.sql

if [ $? -eq 0 ]; then
    echo "✅ Storage buckets created successfully!"
    echo ""
    echo "📋 Created buckets:"
    echo "  - workspace-logos (for workspace logos)"
    echo "  - profile-pictures (for user profile pictures)"
    echo "  - file-banners (for file and folder banners)"
    echo ""
    echo "🎉 You can now upload logos and images in your application!"
else
    echo "❌ Failed to create storage buckets"
    echo "Please check your Supabase setup and try again."
    exit 1
fi 