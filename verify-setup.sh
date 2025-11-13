#!/bin/bash

echo "🔥 Firebase Setup Verification"
echo "=============================="
echo ""

# Check .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
else
    echo "❌ .env.local file missing"
    exit 1
fi

# Check Firebase config files
if [ -f "firebase.json" ]; then
    echo "✅ firebase.json exists"
else
    echo "❌ firebase.json missing"
fi

if [ -f "firestore.rules" ]; then
    echo "✅ firestore.rules exists"
else
    echo "❌ firestore.rules missing"
fi

if [ -f "storage.rules" ]; then
    echo "✅ storage.rules exists"
else
    echo "❌ storage.rules missing"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Enable Firestore in Firebase Console:"
echo "   https://console.firebase.google.com/project/fin-beacon-pro/firestore"
echo "   → Click 'Create database'"
echo "   → Choose 'Start in test mode'"
echo "   → Select region: us-central1"
echo ""
echo "2. Enable Storage in Firebase Console:"
echo "   https://console.firebase.google.com/project/fin-beacon-pro/storage"
echo "   → Click 'Get started'"
echo "   → Choose 'Start in test mode'"
echo "   → Use same region as Firestore"
echo ""
echo "3. Enable Authentication:"
echo "   https://console.firebase.google.com/project/fin-beacon-pro/authentication"
echo "   → Click 'Get started'"
echo "   → Enable Email/Password"
echo "   → Enable Google (add email: webdroid21@gmail.com)"
echo ""
echo "4. Deploy security rules (run in your terminal):"
echo "   firebase deploy --only firestore:rules,storage:rules"
echo ""
echo "5. Start the development server:"
echo "   npm run dev"
echo ""
echo "6. Test the app:"
echo "   http://localhost:3000/register"
echo ""
