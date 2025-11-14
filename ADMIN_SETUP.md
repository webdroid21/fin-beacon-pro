# 🛡️ Admin Setup Guide

## How to Set Up the First Admin User

Since the admin features require an admin role in the database, you need to manually set the first admin user in Firebase Firestore.

---

## 📋 Step-by-Step Setup

### **Method 1: Using Firebase Console (Recommended)**

1. **Register a User Account**
   - Go to your app: `http://localhost:3000/register`
   - Create a new account with your admin email
   - Complete the registration process

2. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `fin-beacon-pro`

3. **Navigate to Firestore Database**
   - Click on **Firestore Database** in the left sidebar
   - You'll see your collections

4. **Find the Users Collection**
   - Click on the `users` collection
   - Find your user document (it will be listed by user ID)

5. **Edit the User Document**
   - Click on your user document
   - Find the `role` field
   - Change the value from `"user"` to `"admin"`
   - Click **Update**

6. **Verify Admin Access**
   - Log out and log back in to your app
   - You should now see the **Admin** menu in the sidebar
   - Navigate to `/admin/dashboard` to access admin features

---

### **Method 2: Using Firestore SDK (Programmatic)**

If you want to create an admin programmatically, create a one-time script:

```typescript
// scripts/set-admin.ts
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function setAdmin(userId: string) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ User is now an admin!');
  } catch (error) {
    console.error('Error setting admin:', error);
  }
}

// Replace with your actual user ID
setAdmin('YOUR_USER_ID_HERE');
```

**Run the script:**
```bash
npx ts-node scripts/set-admin.ts
```

---

### **Method 3: Using Firebase Admin SDK (Server-Side)**

For production, you can use Firebase Admin SDK:

```typescript
// server-side only
import admin from 'firebase-admin';

async function setUserAsAdmin(userId: string) {
  await admin.firestore()
    .collection('users')
    .doc(userId)
    .update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}
```

---

## 🔐 Admin Privileges

Once a user is set as admin, they get access to:

### **Admin Dashboard** (`/admin/dashboard`)
- View platform-wide statistics
- See total users, new signups, active users
- Monitor support ticket metrics
- View recent users and tickets
- Quick access to admin actions

### **User Management** (`/admin/users`)
- View all registered users
- See user details (name, email, business, role)
- Search and filter users
- Promote users to admin
- Demote admins to regular users
- View user join dates and last login

### **Support Management** (`/admin/support`)
- View all support tickets
- Filter by status (open, in-progress, resolved, closed)
- Filter by priority (low, medium, high, urgent)
- Respond to user tickets
- Update ticket status
- Change ticket priority
- View full conversation history

---

## 🚀 Admin Routes

All admin routes are protected and only accessible to users with `role: 'admin'`:

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Admin overview and statistics |
| `/admin/users` | User management and role assignment |
| `/admin/support` | Support ticket management |

---

## 👥 User vs Admin Access

### **Regular User (`role: 'user'`)**
✅ Access to `/dashboard/*` routes
✅ Manage own data (invoices, expenses, payments)
✅ Create support tickets
✅ View documentation
❌ **Cannot** access `/admin/*` routes
❌ **Cannot** manage other users
❌ **Cannot** respond to support tickets

### **Admin User (`role: 'admin'`)**
✅ All regular user features
✅ Access to `/admin/*` routes
✅ View and manage all users
✅ Respond to support tickets
✅ View platform statistics
✅ Promote/demote user roles

---

## 🛡️ Access Control

The app uses the `AdminGuard` component to protect admin routes:

```typescript
<AdminGuard>
  <AdminDashboardContent />
</AdminGuard>
```

**What happens when a non-admin tries to access admin pages:**
1. They see an "Access Denied" screen
2. Option to return to dashboard
3. Option to contact support
4. No error or broken page

---

## 📧 Finding Your User ID

**Method 1: From Firebase Console**
1. Go to Firestore Database
2. Open `users` collection
3. The document ID is your user ID

**Method 2: From Browser Console**
1. Log in to your app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `localStorage.getItem('authUser')`
5. Your user ID is in the `uid` field

**Method 3: From Authentication Tab**
1. Go to Firebase Console → Authentication
2. Click on Users tab
3. Find your email
4. Copy the User UID

---

## 🔄 Adding More Admins

Once you're an admin, you can promote other users through the UI:

1. Go to `/admin/users`
2. Find the user you want to promote
3. Click **Manage Role**
4. Select **Administrator**
5. Click **Update Role**

The user will be promoted immediately and will see admin features on their next login.

---

## ⚠️ Important Security Notes

### **Protect Your Admin Accounts**
- Use strong passwords for admin accounts
- Enable 2FA if available
- Regularly review admin user list
- Only promote trusted users

### **Production Considerations**
- Set up proper Firebase security rules
- Limit admin creation to secure server-side code
- Log all admin actions for audit trails
- Implement admin activity monitoring

### **Firebase Security Rules Example**
```javascript
// firestore.rules
match /users/{userId} {
  // Only allow users to update their own role if they're already an admin
  allow update: if request.auth != null && 
    (request.auth.uid == userId || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
}
```

---

## 📊 Admin Features Overview

### **Dashboard Statistics**
- **User Stats**: Total users, admins, new signups (today/week), active users
- **Support Stats**: Total tickets, open, in-progress, urgent, resolved
- **Recent Activity**: Latest users and tickets
- **Quick Actions**: Fast links to common tasks

### **User Management**
- **Search**: Find users by name, email, or business
- **Filter**: Show only admins or regular users
- **User Details**: View full profile information
- **Role Management**: Promote/demote with one click
- **Activity Tracking**: See join date and last login

### **Support Management**
- **Ticket List**: All support requests in one place
- **Filters**: By status and priority
- **Conversation View**: Full message history
- **Admin Responses**: Reply directly to users
- **Status Updates**: Mark as in-progress, resolved, or closed
- **Priority Control**: Adjust ticket priority

---

## 🎯 First-Time Setup Checklist

- [ ] Create your account at `/register`
- [ ] Note your user ID from Firebase Console
- [ ] Open Firestore Database
- [ ] Navigate to `users` collection
- [ ] Find your user document
- [ ] Change `role` from `"user"` to `"admin"`
- [ ] Save changes
- [ ] Log out and log back in
- [ ] Verify admin menu appears in sidebar
- [ ] Visit `/admin/dashboard` to confirm access
- [ ] Explore admin features
- [ ] Create test support ticket as regular user
- [ ] Respond to it as admin

---

## 🐛 Troubleshooting

### **Admin menu not showing after role change**
- Solution: Log out completely and log back in
- Clear browser cache/cookies if needed
- Check that role is exactly `"admin"` (lowercase)

### **Access denied even with admin role**
- Verify the role field in Firestore is correct
- Check browser console for errors
- Ensure you're logged in
- Try refreshing the page

### **Can't find user ID**
- Check Firebase Console → Authentication → Users
- Look in Firestore → users collection
- User ID = Document ID in users collection

### **Changes not reflecting**
- Wait a few seconds for Firestore sync
- Force refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Check Firebase Console shows the update

---

## 📞 Need Help?

If you're having trouble setting up admin access:

1. **Check Firestore**: Verify the role field is correctly set
2. **Check Console**: Look for errors in browser DevTools
3. **Verify Auth**: Make sure you're logged in
4. **Test Routes**: Try accessing `/admin/dashboard` directly

---

## ✅ Success Indicators

You know admin setup worked when:
- ✅ Admin section appears in sidebar
- ✅ Can access `/admin/dashboard`
- ✅ Can view `/admin/users`
- ✅ Can access `/admin/support`
- ✅ See "Admin" badge in user list
- ✅ Can promote other users to admin

---

**Your admin system is now fully configured!** 🎉

Admin users have complete control over the platform while regular users remain restricted to their own data and standard features.
