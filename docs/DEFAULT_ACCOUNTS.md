# 🏦 Default Accounts - Auto-Created for Every User

## ✅ Automatic Account Setup

When a new user registers (via email, Google, or GitHub), **9 default accounts** are automatically created. This ensures users can start using the system immediately without manual setup.

---

## 📋 Default Accounts Created

### **Asset Accounts (3)**

#### 1. General Account
- **Type:** Asset (Checking)
- **Number:** ACC-001
- **Purpose:** Main business account for daily operations
- **Use for:**
  - Receiving payments
  - Daily transactions
  - Operating expenses
  - Primary cash account

#### 2. Savings Account
- **Type:** Asset (Savings)
- **Number:** ACC-002
- **Purpose:** Savings and reserve funds
- **Use for:**
  - Emergency fund
  - Long-term savings
  - Reserved cash

#### 3. Cash on Hand
- **Type:** Asset (Cash)
- **Number:** ACC-003
- **Purpose:** Physical cash
- **Use for:**
  - Petty cash
  - Cash transactions
  - Small expenses

---

### **Revenue Accounts (2)**

#### 4. Service Revenue
- **Type:** Revenue (Services)
- **Number:** ACC-101
- **Purpose:** Income from services
- **Use for:**
  - Consulting fees
  - Service charges
  - Professional services

#### 5. Sales Revenue
- **Type:** Revenue (Sales)
- **Number:** ACC-102
- **Purpose:** Income from product sales
- **Use for:**
  - Product sales
  - Merchandise
  - Retail income

---

### **Expense Accounts (4)**

#### 6. Rent
- **Type:** Expense (Rent)
- **Number:** ACC-201
- **Purpose:** Office or space rent
- **Use for:**
  - Monthly rent
  - Lease payments

#### 7. Utilities
- **Type:** Expense (Utilities)
- **Number:** ACC-202
- **Purpose:** Electricity, water, internet
- **Use for:**
  - Power bills
  - Water bills
  - Internet/phone

#### 8. Supplies
- **Type:** Expense (Supplies)
- **Number:** ACC-203
- **Purpose:** Office supplies and materials
- **Use for:**
  - Stationery
  - Equipment
  - Materials

#### 9. Marketing
- **Type:** Expense (Marketing)
- **Number:** ACC-204
- **Purpose:** Advertising and marketing expenses
- **Use for:**
  - Ads
  - Promotions
  - Marketing campaigns

---

## 🎯 How It Works

### **Registration Flow**

```
User Registers
    ↓
Create User Profile
    ↓
Create 9 Default Accounts ← Automatic!
    ↓
Redirect to Dashboard
    ↓
Accounts Ready to Use ✅
```

### **All Registration Methods Supported**

✅ **Email/Password** - Creates default accounts  
✅ **Google Sign-In** - Creates default accounts  
✅ **GitHub Sign-In** - Creates default accounts  

---

## 💡 Benefits

### **1. Instant Setup**
- No manual account creation needed
- Start using system immediately
- Professional account structure ready

### **2. Best Practices**
- Proper account types (Asset, Revenue, Expense)
- Standard chart of accounts
- Organized from day one

### **3. Complete Coverage**
- Asset accounts for money tracking
- Revenue accounts for income
- Expense accounts for spending

### **4. Easy to Use**
- Pre-configured for common scenarios
- Descriptive names
- Clear purposes

---

## 📊 Default Account Structure

```
Asset Accounts (Cash & Bank)
├── ACC-001: General Account (Main)
├── ACC-002: Savings Account
└── ACC-003: Cash on Hand

Revenue Accounts (Income)
├── ACC-101: Service Revenue
└── ACC-102: Sales Revenue

Expense Accounts (Costs)
├── ACC-201: Rent
├── ACC-202: Utilities
├── ACC-203: Supplies
└── ACC-204: Marketing
```

---

## 🔄 How Default Accounts Are Used

### **Receiving Payments**
```
Payment from client → General Account
- Automatically increases balance
- Tracks income
```

### **Recording Expenses**
```
Rent payment → Links to Rent Expense Account
- From: General Account (-800,000)
- To: Rent Account (+800,000)
- Proper tracking
```

### **Recording Income**
```
Service income → Links to Service Revenue
- To: General Account (+2,000,000)
- From: Service Revenue (+2,000,000)
- Revenue tracked
```

### **Transferring Funds**
```
Move to savings → Transfer between accounts
- From: General Account (-1,000,000)
- To: Savings Account (+1,000,000)
- Cash organized
```

---

## ✏️ Customization

Users can:
- ✅ **Add more accounts** anytime
- ✅ **Rename default accounts** (future feature)
- ✅ **Deactivate unused accounts**
- ✅ **Create custom account types**
- ✅ **Adjust balances** as needed

Default accounts provide a **starting point**, not a limitation!

---

## 🧪 Testing

### **Test Registration**
```bash
# 1. Register new user
Email: test@example.com
Password: Test123!
Name: Test User

# 2. Login to dashboard

# 3. Navigate to /dashboard/accounts

# 4. Verify 9 accounts exist:
✅ General Account (ACC-001)
✅ Savings Account (ACC-002)
✅ Cash on Hand (ACC-003)
✅ Service Revenue (ACC-101)
✅ Sales Revenue (ACC-102)
✅ Rent (ACC-201)
✅ Utilities (ACC-202)
✅ Supplies (ACC-203)
✅ Marketing (ACC-204)

# 5. Check balances
All should be 0 initially

# 6. Ready to use!
Record payment → Select General Account ✅
Record expense → Links to Rent ✅
Transfer funds → Between General & Savings ✅
```

---

## 🎨 User Experience

### **Before (Without Default Accounts)**
```
1. User registers
2. Tries to record payment
3. Error: "No accounts found"
4. Must manually create accounts first
5. Confused about what to create
❌ Poor onboarding experience
```

### **After (With Default Accounts)**
```
1. User registers
2. Accounts automatically created
3. Can immediately record payment
4. Select from pre-configured accounts
5. Professional structure ready
✅ Smooth onboarding experience
```

---

## 💰 Currency

All default accounts use **UGX** (Ugandan Shilling) by default.

Future enhancement: Set default currency based on user's location or preferences.

---

## 🔧 Technical Details

### **Creation Code**
```typescript
const defaultAccounts = [
  {
    accountNumber: 'ACC-001',
    name: 'General Account',
    type: 'asset',
    subtype: 'checking',
    balance: 0,
    currency: 'UGX',
    isActive: true,
  },
  // ... 8 more accounts
];

await Promise.all(
  defaultAccounts.map(account => 
    createAccount(userId, account)
  )
);
```

### **When Created**
- During registration (all methods)
- After user profile creation
- Before dashboard redirect
- Asynchronous batch creation

---

## 🔜 Future Enhancements

### **Smart Defaults**
- [ ] Currency based on location
- [ ] Industry-specific accounts
- [ ] Custom default templates
- [ ] Bulk import/export

### **Account Templates**
- [ ] Freelancer template
- [ ] E-commerce template
- [ ] Agency template
- [ ] Custom templates

---

## ✨ Summary

**Every new user automatically gets:**

✅ **3 Asset Accounts** - General, Savings, Cash  
✅ **2 Revenue Accounts** - Services, Sales  
✅ **4 Expense Accounts** - Rent, Utilities, Supplies, Marketing  
✅ **Professional structure** from day one  
✅ **Ready to use** immediately  
✅ **Organized finances** by default  

**No setup required - just register and start tracking!** 🎉

---

## 📚 Related Documentation

- `ACCOUNTS_EXPENSES_SYSTEM.md` - Account management details
- `PAYMENT_ACCOUNTING_INTEGRATION.md` - How payments use accounts
- `FINANCIAL_MODULES.md` - Complete system overview

**Your users now get a professional accounting setup automatically!** 🏦✅
