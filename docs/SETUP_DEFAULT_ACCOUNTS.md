# 🔧 Setup Default Accounts - Integration Guide

## ✅ File Created

`/src/lib/default-accounts.ts` - Helper function to create 9 default accounts for new users

---

## 📝 Integration Steps

You need to add the default account creation to your auth file. Here's how:

### **Step 1: Update `/src/lib/auth.ts`**

#### **1.1 Add Import (at the top of the file)**
```typescript
import { createDefaultAccounts } from './default-accounts';
```

#### **1.2 Update `createOrUpdateUserProfile` function**

Find this section (around line 110):
```typescript
if (!userSnap.exists()) {
  // Create new user profile
  const newUser: Partial<User> = {
    // ... existing code ...
  };

  await setDoc(userRef, newUser);
} else {
  // Update last login
  // ... existing code ...
}
```

**Change it to:**
```typescript
if (!userSnap.exists()) {
  // Create new user profile
  const newUser: Partial<User> = {
    // ... existing code ...
  };

  await setDoc(userRef, newUser);
  
  // Create default accounts for new user
  await createDefaultAccounts(firebaseUser.uid);
} else {
  // Update last login
  // ... existing code ...
}
```

---

## 🎯 What This Does

When a user registers (via email, Google, or GitHub), the system will automatically create:

### **Asset Accounts (3)**
- General Account (ACC-001) - Main checking account
- Savings Account (ACC-002) - Savings
- Cash on Hand (ACC-003) - Physical cash

### **Revenue Accounts (2)**
- Service Revenue (ACC-101) - Income from services
- Sales Revenue (ACC-102) - Income from sales

### **Expense Accounts (4)**
- Rent (ACC-201) - Office rent
- Utilities (ACC-202) - Electricity, water, internet
- Supplies (ACC-203) - Office supplies
- Marketing (ACC-204) - Marketing expenses

---

## 🧪 Testing

After making the changes:

```bash
# 1. Register a new test user
Email: testuser@example.com
Password: Test123!

# 2. Login

# 3. Navigate to /dashboard/accounts

# 4. Verify 9 accounts are automatically created
```

---

## 📋 Complete Code Example

Here's what your updated `createOrUpdateUserProfile` function should look like:

```typescript
import { createDefaultAccounts } from './default-accounts';

export const createOrUpdateUserProfile = async (
  firebaseUser: FirebaseUser,
  displayName?: string
): Promise<void> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const now = new Date().toISOString();

  if (!userSnap.exists()) {
    // Create new user profile
    const newUser: Partial<User> = {
      userId: firebaseUser.uid,
      authProvider: firebaseUser.providerData[0]?.providerId.includes('google') ? 'google' : 
                    firebaseUser.providerData[0]?.providerId.includes('github') ? 'github' : 'email',
      email: firebaseUser.email || '',
      displayName: displayName || firebaseUser.displayName || '',
      photoUrl: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      businessProfile: {
        name: '',
        address: {
          street: '',
          city: '',
          country: '',
        },
        phone: '',
        currency: 'USD',
        language: 'en',
        timezone: 'UTC',
      },
      settings: {
        theme: 'system',
        notifications: {
          email: true,
          sms: false,
          inApp: true,
        },
        defaultInvoicePrefix: 'INV-',
        autoGenerateInvoiceNumbers: true,
        dateFormat: 'DD/MM/YYYY',
        defaultPaymentMethod: 'cash',
      },
      role: 'user',
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
    };

    await setDoc(userRef, newUser);
    
    // ← ADD THIS LINE
    // Create default accounts for new user
    await createDefaultAccounts(firebaseUser.uid);
    // ← END ADD
    
  } else {
    // Update last login
    await setDoc(
      userRef,
      {
        lastLogin: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }
};
```

---

## ✅ That's It!

After this change, every new user will automatically have 9 accounts ready to use! 🎉

**Works for all registration methods:**
- ✅ Email/Password
- ✅ Google Sign-In
- ✅ GitHub Sign-In
