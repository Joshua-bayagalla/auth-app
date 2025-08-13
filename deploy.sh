#!/bin/bash

# 🚀 DriveNow Rentals App Deployment Script
# This script helps prepare your app for deployment

echo "🚀 DriveNow Rentals App - Deployment Preparation"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "backend/main.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

# Check backend requirements
echo "🐍 Checking backend requirements..."
cd backend
if [ ! -f "requirements.txt" ]; then
    echo "❌ Backend requirements.txt not found"
    exit 1
fi

echo "✅ Backend requirements verified"

# Create uploads directories
echo "📁 Creating upload directories..."
mkdir -p uploads/vehicles uploads/documents uploads/payments

echo "✅ Upload directories created"

# Go back to root
cd ..

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Render:"
echo "   - Go to https://render.com"
echo "   - Click 'New +' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Click 'Apply'"
echo ""
echo "3. Set environment variables:"
echo "   - VITE_API_BASE_URL = [your-backend-url]"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "�� Happy deploying!"

