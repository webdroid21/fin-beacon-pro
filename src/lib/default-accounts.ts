import { createAccount } from './firestore-financial';

/**
 * Creates default accounts for a new user
 * Called during registration (email, Google, or GitHub)
 */
export async function createDefaultAccounts(userId: string): Promise<void> {
  const defaultAccounts = [
    // Asset Accounts
    {
      accountId: `ACC-GEN-${Date.now()}`,
      accountNumber: 'ACC-001',
      name: 'General Account',
      type: 'asset' as const,
      subtype: 'checking',
      description: 'Main business account for daily operations',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
    {
      accountId: `ACC-SAV-${Date.now() + 1}`,
      accountNumber: 'ACC-002',
      name: 'Savings Account',
      type: 'asset' as const,
      subtype: 'savings',
      description: 'Savings and reserve funds',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
    {
      accountId: `ACC-CASH-${Date.now() + 2}`,
      accountNumber: 'ACC-003',
      name: 'Cash on Hand',
      type: 'asset' as const,
      subtype: 'cash',
      description: 'Physical cash',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
    // Revenue Accounts
    {
      accountId: `ACC-REV-${Date.now() + 3}`,
      accountNumber: 'ACC-101',
      name: 'Service Revenue',
      type: 'revenue' as const,
      subtype: 'services',
      description: 'Income from services',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
    {
      accountId: `ACC-REV2-${Date.now() + 4}`,
      accountNumber: 'ACC-102',
      name: 'Sales Revenue',
      type: 'revenue' as const,
      subtype: 'sales',
      description: 'Income from product sales',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
    // Expense Accounts
    {
      accountId: `ACC-EXP-${Date.now() + 5}`,
      accountNumber: 'ACC-201',
      name: 'Rent',
      type: 'expense' as const,
      subtype: 'rent',
      description: 'Office or space rent',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
    {
      accountId: `ACC-EXP2-${Date.now() + 6}`,
      accountNumber: 'ACC-202',
      name: 'Utilities',
      type: 'expense' as const,
      subtype: 'utilities',
      description: 'Electricity, water, internet',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
    {
      accountId: `ACC-EXP3-${Date.now() + 7}`,
      accountNumber: 'ACC-203',
      name: 'Supplies',
      type: 'expense' as const,
      subtype: 'supplies',
      description: 'Office supplies and materials',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
    {
      accountId: `ACC-EXP4-${Date.now() + 8}`,
      accountNumber: 'ACC-204',
      name: 'Marketing',
      type: 'expense' as const,
      subtype: 'marketing',
      description: 'Advertising and marketing expenses',
      currency: 'UGX',
      balance: 0,
      isActive: true,
    },
  ];

  try {
    // Create all default accounts in parallel
    await Promise.all(
      defaultAccounts.map(account => createAccount(userId, account))
    );
    console.log(`✅ Created ${defaultAccounts.length} default accounts for user ${userId}`);
  } catch (error) {
    console.error('Error creating default accounts:', error);
    // Don't throw - user can create accounts manually if this fails
  }
}
