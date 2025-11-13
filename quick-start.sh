#!/bin/bash

echo "🚀 Fin Beacon Pro - Quick Start"
echo "================================"
echo ""

# Check if services are enabled
echo "📋 Pre-flight Checklist:"
echo ""
echo "Before running the app, ensure you've completed these steps in Firebase Console:"
echo ""
echo "1. ✅ Firestore enabled:"
echo "   https://console.firebase.google.com/project/fin-beacon-pro/firestore"
echo ""
echo "2. ✅ Storage enabled:"
echo "   https://console.firebase.google.com/project/fin-beacon-pro/storage"
echo ""
echo "3. ✅ Authentication enabled (Email/Password + Google):"
echo "   https://console.firebase.google.com/project/fin-beacon-pro/authentication"
echo ""
echo "4. ✅ Security rules deployed:"
echo "   firebase deploy --only firestore:rules,storage:rules"
echo ""

read -p "Have you completed all the above steps? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "⚠️  Please complete the Firebase Console setup first!"
    echo "   See SETUP_COMPLETE.md for detailed instructions."
    exit 1
fi

echo ""
echo "🧹 Cleaning up any existing processes..."

# Kill any process on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   Stopping process on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Kill any next dev processes
if pgrep -f "next dev" > /dev/null 2>&1; then
    echo "   Stopping Next.js dev servers..."
    pkill -f "next dev" 2>/dev/null
    sleep 1
fi

echo ""
echo "🔍 Verifying setup..."

# Check .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    echo "   Please create .env.local with your Firebase credentials."
    exit 1
fi

# Check for Firebase API key in .env.local
if ! grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" .env.local; then
    echo "❌ Error: Firebase credentials not configured in .env.local"
    exit 1
fi

echo "✅ Configuration files verified"
echo ""

# Clean Next.js cache if it exists
if [ -d ".next" ]; then
    echo "🧹 Cleaning Next.js cache..."
    rm -rf .next
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "   Access the app at:"
echo "   → Register: http://localhost:3000/register"
echo "   → Login:    http://localhost:3000/login"
echo "   → Dashboard: http://localhost:3000/dashboard"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
