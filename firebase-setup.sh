#!/bin/bash

echo "🔥 Firebase Setup Script"
echo "========================"
echo ""

# Check if user is logged in
echo "Checking Firebase login status..."
firebase projects:list > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Already logged in to Firebase"
else
    echo "❌ Not logged in. Please run: firebase login"
    exit 1
fi

echo ""
echo "📋 Available Projects:"
firebase projects:list

echo ""
echo "🔧 Initializing Firebase..."
echo ""
echo "When prompted:"
echo "  1. Select: Firestore and Storage"
echo "  2. Choose: Use an existing project"
echo "  3. Select: fin-beacon-pro"
echo "  4. Accept default file paths"
echo ""

# Run firebase init
firebase init firestore storage

echo ""
echo "📤 Deploying security rules..."
firebase deploy --only firestore:rules,storage:rules

echo ""
echo "✅ Firebase setup complete!"
echo ""
echo "Next steps:"
echo "  1. Get Firebase config from console"
echo "  2. Create .env.local file"
echo "  3. Run: npm run dev"
