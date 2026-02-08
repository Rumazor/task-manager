#!/bin/bash

# Database Seed Script
# This script resets the database and populates it with test data

echo "🌱 Starting database seed..."
echo ""

# Check if containers are running
if ! docker compose ps | grep -q "Up"; then
  echo "⚠️  Containers are not running. Starting them first..."
  docker compose up -d
  echo "⏳ Waiting for services to be ready..."
  sleep 10
fi

# Run the seed script inside the NestJS container
echo "🔄 Running seed script..."
docker compose exec nestjs yarn seed

echo ""
echo "✅ Seeding complete!"
echo ""
echo "You can now login with:"
echo "  Email: admin@test.com"
echo "  Password: password123"
echo ""
