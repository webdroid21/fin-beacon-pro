# Fin Beacon Pro - Setup Guide

A comprehensive finance management application built with Next.js, Firebase, and shadcn/ui.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account
- Git

### Step 1: Fix npm Cache (If needed)

If you encounter permission errors during installation, run:

```bash
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
npm cache clean --force
```

### Step 2: Install Dependencies

```bash
npm install
```

Or install with legacy peer deps if you encounter issues:

```bash
npm install --legacy-peer-deps
```

### Step 3: Firebase Project Setup

1. **Go to [Firebase Console](https://console.firebase.google.com/)**

2. **Create a new project:**
   - Click "Add project"
   - Name: "Fin Beacon Pro" (or your choice)
   - Enable Google Analytics (optional)

3. **Enable Authentication:**
   - Navigate to **Build → Authentication**
   - Click "Get Started"
   - Enable these sign-in methods:
     - ✅ Google
     - ✅ Email/Password
     - ✅ GitHub (optional)

4. **Create Firestore Database:**
   - Navigate to **Build → Firestore Database**
   - Click "Create database"
   - **Start in test mode** (we'll deploy security rules later)
   - Select your preferred region (e.g., `africa-south1`, `us-central1`)

5. **Enable Cloud Storage:**
   - Navigate to **Build → Storage**
   - Click "Get started"
   - Start in test mode
   - Use the same region as Firestore

6. **Get Firebase Config:**
   - Go to **Project Settings** (⚙️ icon)
   - Scroll to "Your apps"
   - Click the **Web** icon `</>`
   - Register app: "Fin Beacon Web"
   - Copy the `firebaseConfig` object

### Step 4: Environment Variables

1. Create `.env.local` file in the project root:

```bash
cp ENV_TEMPLATE.md .env.local
```

2. Open `.env.local` and fill in your Firebase credentials:

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

### Step 5: Deploy Firestore Security Rules

Install Firebase CLI globally:

```bash
npm install -g firebase-tools
```

Login to Firebase:

```bash
firebase login
```

Initialize Firebase in your project:

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Storage
- Use existing project → Select your project
- Use default files: `firestore.rules` and `storage.rules`

Deploy security rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

### Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── dashboard/                # Dashboard routes
│   ├── api/                      # API routes
│   └── (auth)/                   # Auth pages
├── components/                   # React components
│   ├── ui/                       # shadcn UI components
│   ├── charts/                   # Chart components
│   ├── forms/                    # Form components
│   ├── tables/                   # Table components
│   └── dashboard/                # Dashboard widgets
├── lib/                          # Core utilities
│   ├── firebase.ts               # Firebase initialization
│   ├── auth.ts                   # Authentication helpers
│   ├── firestore.ts              # Firestore CRUD operations
│   └── storage.ts                # Cloud Storage helpers
├── context/                      # React Context providers
│   └── AuthContext.tsx           # Authentication context
├── hooks/                        # Custom React hooks
│   └── useAuth.ts                # Auth hook
├── types/                        # TypeScript type definitions
│   ├── user.ts
│   ├── client.ts
│   ├── invoice.ts
│   ├── payment.ts
│   ├── expense.ts
│   └── budget.ts
└── utils/                        # Helper functions
    ├── formatDate.ts
    ├── currency.ts
    ├── generateId.ts
    ├── validateEmail.ts
    └── calculateTotals.ts
```

## 🔐 Security Rules

Security rules are configured to ensure:
- Users can only access their own data
- Authenticated users required for all operations
- File size limits on uploads
- Proper file type validation

## 🎨 UI Components (shadcn)

Install shadcn components as needed:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add toast
```

## 🧪 Testing Firebase Connection

After setup, create a simple test by signing up with email/password or Google.

Check Firestore console to verify that:
1. A user document was created in `/users/{userId}`
2. The document contains the correct structure

## 📝 Next Steps

1. **Complete Authentication UI**
   - Build login/register pages
   - Add password reset flow
   - Implement social auth buttons

2. **Create Dashboard Layout**
   - Design main navigation
   - Build sidebar
   - Add user profile dropdown

3. **Build Invoice Module**
   - Invoice list view
   - Create invoice form
   - PDF generation
   - Email integration

4. **Implement Other Modules**
   - Payments tracking
   - Client management
   - Expense tracking
   - Budget planning
   - Analytics dashboard

## 🆘 Troubleshooting

### Firebase Connection Issues

- Verify `.env.local` values match Firebase console
- Check that Firebase services are enabled
- Ensure billing is enabled (for Storage)

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Permission Issues

```bash
# Fix npm permissions
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Support

For issues or questions, please refer to the documentation or create an issue in the repository.
