#!/bin/bash

# Komal Portfolio Contact Form - Deployment Script
# This script helps deploy the contact form backend to various platforms

echo "🚀 Komal Portfolio Contact Form - Deployment Script"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before deploying."
    echo "   Required variables:"
    echo "   - EMAIL_USER"
    echo "   - EMAIL_PASS"
    echo "   - RECIPIENT_EMAIL"
    echo "   - FRONTEND_URL"
fi

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed"
else
    echo "❌ Tests failed. Please fix issues before deploying."
    exit 1
fi

# Check environment variables
echo "🔍 Checking environment variables..."
source .env

if [ -z "$EMAIL_USER" ] || [ -z "$EMAIL_PASS" ] || [ -z "$RECIPIENT_EMAIL" ]; then
    echo "❌ Required environment variables are missing."
    echo "   Please set EMAIL_USER, EMAIL_PASS, and RECIPIENT_EMAIL in .env file"
    exit 1
fi

echo "✅ Environment variables configured"

# Start the server
echo "🚀 Starting server..."
echo "   Server will run on port ${PORT:-3000}"
echo "   Frontend URL: ${FRONTEND_URL:-http://localhost:8000}"
echo "   Recipient Email: ${RECIPIENT_EMAIL}"

# Start the server
npm start



