# Next Steps - Firebase Setup Checklist

## ✅ Completed

- [x] Project structure created with all folders
- [x] TypeScript types defined for all data models
- [x] Firebase SDK installed and configured
- [x] Authentication helpers created
- [x] Firestore CRUD utilities created
- [x] Storage helpers created
- [x] AuthContext and useAuth hook created
- [x] Utility functions for date, currency, validation
- [x] Firestore and Storage security rules created
- [x] Login and Register pages created
- [x] Dashboard page created

## 🔧 To Do - Firebase Configuration

### 1. Fix npm Cache (Required First)

Run this command in your terminal:

```bash
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
npm cache clean --force
```

### 2. Install shadcn UI Components

After fixing the cache, run:

```bash
npx shadcn@latest add button input card form label dialog dropdown-menu select sonner table separator tabs
```

### 3. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Name it: **"Fin Beacon Pro"** (or your choice)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

### 4. Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **"Get Started"**
3. Enable sign-in methods:
   - ✅ **Email/Password** - Click "Enable" → Save
   - ✅ **Google** - Click "Enable" → Add support email → Save
   - ✅ **GitHub** (optional) - Requires GitHub OAuth app setup

### 5. Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll deploy rules later)
4. Choose your region:
   - For Africa: `africa-south1` (Johannesburg)
   - For US: `us-central1`
   - For Europe: `europe-west1`
5. Click "Enable"

### 6. Enable Cloud Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Select **"Start in test mode"**
4. Use the **same region** as Firestore
5. Click "Done"

### 7. Get Firebase Configuration

1. In Firebase Console, click the **⚙️ gear icon** (Project Settings)
2. Scroll to **"Your apps"** section
3. Click the **Web icon** `</>`
4. Register your app:
   - App nickname: **"Fin Beacon Web"**
   - Don't enable Firebase Hosting yet
5. Click **"Register app"**
6. **Copy the `firebaseConfig` object**

It should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

### 8. Create Environment Variables File

1. Create a file named `.env.local` in the project root
2. Add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Fin Beacon Pro
```

### 9. Install Firebase CLI & Deploy Security Rules

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# ✅ Firestore
# ✅ Storage
# Select "Use an existing project"
# Choose your project
# Accept default files: firestore.rules and storage.rules

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules
```

### 10. Test the Setup

```bash
# Start the development server
npm run dev
```

Then:

1. Open [http://localhost:3000/register](http://localhost:3000/register)
2. Create an account using:
   - Email/Password, or
   - Google Sign In, or
   - GitHub Sign In
3. You should be redirected to the dashboard
4. Check Firebase Console:
   - **Authentication** tab → You should see your user
   - **Firestore** tab → You should see a `users/{userId}` document

## 🎯 What's Working Now

After completing the above steps, you'll have:

- ✅ User authentication (Email, Google, GitHub)
- ✅ User profiles stored in Firestore
- ✅ Secure access to Firestore and Storage
- ✅ Login/Register pages
- ✅ Protected dashboard
- ✅ Auto-redirect for unauthenticated users

## 📋 Module Development Order

Once Firebase is working, build modules in this order:

1. **User Settings** (complete business profile)
2. **Client Management** (add/edit/delete clients)
3. **Invoice System** (create, view, edit invoices)
4. **Payment Tracking** (link payments to invoices)
5. **Expense Tracking** (record expenses with receipts)
6. **Budget Planning** (monthly budgets)
7. **Analytics Dashboard** (charts and insights)
8. **PDF Generation** (invoice PDFs)
9. **Email Integration** (send invoices)

## 🐛 Troubleshooting

### Error: "Firebase config is missing"

- Make sure `.env.local` exists and has all variables
- Restart dev server after creating `.env.local`

### Error: "Permission denied" in Firestore

- Deploy security rules: `firebase deploy --only firestore:rules`
- Check that you're authenticated

### Error: "Storage upload failed"

- Ensure Storage is enabled in Firebase Console
- Deploy storage rules: `firebase deploy --only storage:rules`

### Build errors or cache issues

```bash
# Clean everything and reinstall
rm -rf .next node_modules package-lock.json
npm install
```

## 📞 Need Help?

- Firebase Docs: https://firebase.google.com/docs
- Next.js Docs: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com

---

**Ready to start? Follow the checklist above! 🚀**
