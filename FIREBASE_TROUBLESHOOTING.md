# Firebase Setup Troubleshooting

## Issue: "Failed to make request" during `firebase init`

### Root Cause
The error occurs because Firestore and Storage need to be enabled in the Firebase Console **before** running `firebase init`.

---

## ✅ Solution: Enable Services First

### 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **"Fin Beacon Pro"**
3. Click **"Build"** → **"Firestore Database"**
4. Click **"Create database"**
5. Choose **"Start in test mode"**
6. Select region:
   - **US:** `us-central1`
   - **Africa:** `africa-south1`
   - **Europe:** `europe-west1`
7. Click **"Enable"**
8. Wait for creation to complete (~30 seconds)

### 2. Enable Cloud Storage

1. In Firebase Console, click **"Build"** → **"Storage"**
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Use the **same region** as Firestore
5. Click **"Done"**

### 3. Enable Authentication

1. Click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable these providers:
   - ✅ **Email/Password** → Enable → Save
   - ✅ **Google** → Enable → Add support email (webdroid21@gmail.com) → Save
   - ✅ **GitHub** (optional) → Requires OAuth app

---

## 🔄 After Enabling Services

### Option A: Use Firebase CLI (Recommended)

```bash
# Logout and login again
npx firebase-tools logout
npx firebase-tools login

# Initialize Firebase
npx firebase-tools init

# Select:
# ✅ Firestore
# ✅ Storage
# Choose: "Use an existing project"
# Select: fin-beacon-pro

# Use these files:
# Firestore rules: firestore.rules (already exists)
# Storage rules: storage.rules (already exists)

# Deploy the rules
npx firebase-tools deploy --only firestore:rules,storage:rules
```

### Option B: Manual Setup (If CLI Issues Persist)

If `firebase init` continues to fail, you can manually configure the rules in Firebase Console:

#### Firestore Rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the content with the rules from `firestore.rules` file
3. Click **"Publish"**

#### Storage Rules:

1. Go to **Storage** → **Rules** tab
2. Replace the content with the rules from `storage.rules` file
3. Click **"Publish"**

---

## 📋 Quick Checklist

Before running the app, ensure:

- [x] Firebase project created
- [x] Firestore Database enabled (test mode)
- [x] Cloud Storage enabled (test mode)
- [x] Authentication enabled (Email/Password, Google)
- [x] Firebase config added to `.env.local`
- [x] Security rules deployed (via CLI or Console)

---

## 🔑 Get Firebase Config

1. Go to **Project Settings** (⚙️ icon)
2. Scroll to **"Your apps"**
3. If no web app exists:
   - Click the **Web icon** `</>`
   - Register app: "Fin Beacon Web"
4. Copy the `firebaseConfig` values
5. Add to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fin-beacon-pro.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fin-beacon-pro
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fin-beacon-pro.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Fin Beacon Pro
```

---

## 🚀 Test Your Setup

After everything is configured:

```bash
# Start development server
npm run dev
```

Then visit:
- http://localhost:3000/register - Create an account
- http://localhost:3000/login - Sign in
- http://localhost:3000/dashboard - View dashboard

---

## ⚠️ Common Errors

### "Firebase config is missing"
- Create `.env.local` with your Firebase credentials
- Restart dev server: Stop and run `npm run dev` again

### "Permission denied" in Firestore
- Deploy security rules
- Or manually publish rules in Firebase Console

### "Storage upload failed"
- Check Storage is enabled
- Verify storage rules are deployed

### "Auth popup blocked"
- Allow popups for localhost
- Or use redirect method instead of popup

---

## 📞 Still Having Issues?

If problems persist:

1. Check Firebase Console for billing status (Free tier should work)
2. Verify you're the owner of the Firebase project
3. Try creating a new Firebase project
4. Check [Firebase Status](https://status.firebase.google.com/)

---

## 🎯 Next: Test Authentication

Once setup is complete:

1. Go to http://localhost:3000/register
2. Create an account with email/password
3. Check Firebase Console → Authentication (user should appear)
4. Check Firebase Console → Firestore (user document should exist)
5. Try Google Sign-in
6. View the dashboard

**Everything working? You're ready to build the first module! 🎉**
