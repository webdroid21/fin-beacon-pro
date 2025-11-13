#!/bin/bash

echo "🔥 Deploying Firebase Security Rules"
echo "====================================="
echo ""

# Check if logged in
echo "Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase"
    echo "   Run: firebase login"
    exit 1
fi

echo "✅ Authenticated"
echo ""

# Check if rules files exist
if [ ! -f "firestore.rules" ]; then
    echo "❌ firestore.rules not found!"
    exit 1
fi

if [ ! -f "storage.rules" ]; then
    echo "❌ storage.rules not found!"
    exit 1
fi

echo "✅ Rules files found"
echo ""

echo "📤 Deploying Firestore and Storage rules..."
echo ""

# Deploy rules
firebase deploy --only firestore:rules,storage

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Security rules deployed successfully!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 Your Firebase setup is complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Start the dev server: npm run dev"
    echo "  2. Open: http://localhost:3000/register"
    echo "  3. Create an account and test!"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Ensure Firestore is enabled:"
    echo "     https://console.firebase.google.com/project/fin-beacon-pro/firestore"
    echo ""
    echo "  2. Ensure Storage is enabled:"
    echo "     https://console.firebase.google.com/project/fin-beacon-pro/storage"
    echo ""
    echo "  3. Check you have permissions on the project"
    echo ""
    exit 1
fi
