/**
 * Firestore helper functions for financial modules
 * CRUD operations for clients, invoices, payments, expenses, budgets, and accounting
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Client,
  Invoice,
  Payment,
  Expense,
  Budget,
  Account,
  Transaction,
} from '@/types/financial';

// ============================================================================
// CLIENTS
// ============================================================================

export const createClient = async (userId: string, clientData: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'clients'), {
    ...clientData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getClient = async (clientId: string): Promise<Client | null> => {
  const docRef = doc(db, 'clients', clientId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Client;
  }
  return null;
};

export const getUserClients = async (userId: string): Promise<Client[]> => {
  const q = query(
    collection(db, 'clients'),
    where('userId', '==', userId),
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Client[];
};

export const updateClient = async (clientId: string, data: Partial<Client>): Promise<void> => {
  const docRef = doc(db, 'clients', clientId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteClient = async (clientId: string): Promise<void> => {
  await deleteDoc(doc(db, 'clients', clientId));
};

// ============================================================================
// INVOICES
// ============================================================================

export const createInvoice = async (userId: string, invoiceData: Omit<Invoice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'invoices'), {
    ...invoiceData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getInvoice = async (invoiceId: string): Promise<Invoice | null> => {
  const docRef = doc(db, 'invoices', invoiceId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Invoice;
  }
  return null;
};

export const getUserInvoices = async (userId: string): Promise<Invoice[]> => {
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    orderBy('issueDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Invoice[];
};

export const getClientInvoices = async (userId: string, clientId: string): Promise<Invoice[]> => {
  const q = query(
    collection(db, 'invoices'),
    where('userId', '==', userId),
    where('clientId', '==', clientId),
    orderBy('issueDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Invoice[];
};

export const updateInvoice = async (invoiceId: string, data: Partial<Invoice>): Promise<void> => {
  const docRef = doc(db, 'invoices', invoiceId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  await deleteDoc(doc(db, 'invoices', invoiceId));
};

// ============================================================================
// PAYMENTS
// ============================================================================

export const createPayment = async (userId: string, paymentData: Omit<Payment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const batch = writeBatch(db);

  // Create payment
  const paymentRef = doc(collection(db, 'payments'));
  batch.set(paymentRef, {
    ...paymentData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Update invoice amountPaid and balanceDue
  if (paymentData.invoiceId) {
    const invoiceRef = doc(db, 'invoices', paymentData.invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    
    if (invoiceSnap.exists()) {
      const invoice = invoiceSnap.data() as Invoice;
      const newAmountPaid = (invoice.amountPaid || 0) + paymentData.amount;
      const newBalanceDue = invoice.total - newAmountPaid;
      const newStatus = newBalanceDue <= 0 ? 'paid' : invoice.status;

      batch.update(invoiceRef, {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  await batch.commit();
  return paymentRef.id;
};

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
  const docRef = doc(db, 'payments', paymentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Payment;
  }
  return null;
};

export const getUserPayments = async (userId: string): Promise<Payment[]> => {
  const q = query(
    collection(db, 'payments'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Payment[];
};

export const getInvoicePayments = async (invoiceId: string, userId?: string): Promise<Payment[]> => {
  // If userId is provided, include it in the query (required by security rules)
  const q = userId
    ? query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        where('invoiceId', '==', invoiceId),
        orderBy('date', 'desc')
      )
    : query(
        collection(db, 'payments'),
        where('invoiceId', '==', invoiceId),
        orderBy('date', 'desc')
      );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Payment[];
};

export const updatePayment = async (paymentId: string, data: Partial<Payment>): Promise<void> => {
  const docRef = doc(db, 'payments', paymentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deletePayment = async (paymentId: string): Promise<void> => {
  await deleteDoc(doc(db, 'payments', paymentId));
};

// ============================================================================
// EXPENSES
// ============================================================================

export const createExpense = async (userId: string, expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'expenses'), {
    ...expenseData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getExpense = async (expenseId: string): Promise<Expense | null> => {
  const docRef = doc(db, 'expenses', expenseId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Expense;
  }
  return null;
};

export const getUserExpenses = async (userId: string): Promise<Expense[]> => {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[];
};

export const getExpensesByMonth = async (userId: string, month: string): Promise<Expense[]> => {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    where('month', '==', month),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[];
};

export const updateExpense = async (expenseId: string, data: Partial<Expense>): Promise<void> => {
  const docRef = doc(db, 'expenses', expenseId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  await deleteDoc(doc(db, 'expenses', expenseId));
};

// ============================================================================
// BUDGETS
// ============================================================================

export const createBudget = async (userId: string, budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'budgets'), {
    ...budgetData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getBudget = async (budgetId: string): Promise<Budget | null> => {
  const docRef = doc(db, 'budgets', budgetId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Budget;
  }
  return null;
};

export const getUserBudgets = async (userId: string): Promise<Budget[]> => {
  const q = query(
    collection(db, 'budgets'),
    where('userId', '==', userId),
    orderBy('year', 'desc'),
    orderBy('month', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Budget[];
};

export const getBudgetByMonth = async (userId: string, month: string): Promise<Budget | null> => {
  const q = query(
    collection(db, 'budgets'),
    where('userId', '==', userId),
    where('month', '==', month),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Budget;
  }
  return null;
};

export const updateBudget = async (budgetId: string, data: Partial<Budget>): Promise<void> => {
  const docRef = doc(db, 'budgets', budgetId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  await deleteDoc(doc(db, 'budgets', budgetId));
};

// ============================================================================
// ACCOUNTS (Accounting Module)
// ============================================================================

export const createAccount = async (userId: string, accountData: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // Check if account name already exists for this user
  const accountsRef = collection(db, 'accounts');
  const nameQuery = query(
    accountsRef,
    where('userId', '==', userId),
    where('name', '==', accountData.name)
  );
  
  const existingAccounts = await getDocs(nameQuery);
  
  if (!existingAccounts.empty) {
    throw new Error(`An account with the name "${accountData.name}" already exists. Please use a different name.`);
  }
  
  const docRef = await addDoc(collection(db, 'accounts'), {
    ...accountData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getAccount = async (accountId: string): Promise<Account | null> => {
  const docRef = doc(db, 'accounts', accountId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Account;
  }
  return null;
};

export const getUserAccounts = async (userId: string): Promise<Account[]> => {
  const q = query(
    collection(db, 'accounts'),
    where('userId', '==', userId),
    orderBy('accountNumber', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Account[];
};

export const updateAccount = async (accountId: string, data: Partial<Account>): Promise<void> => {
  // If updating name, check for uniqueness
  if (data.name) {
    const accountRef = doc(db, 'accounts', accountId);
    const accountSnap = await getDoc(accountRef);
    
    if (accountSnap.exists()) {
      const accountData = accountSnap.data() as Account;
      
      // Check if another account with this name exists for the same user
      const accountsRef = collection(db, 'accounts');
      const nameQuery = query(
        accountsRef,
        where('userId', '==', accountData.userId),
        where('name', '==', data.name)
      );
      
      const existingAccounts = await getDocs(nameQuery);
      
      // Make sure it's not the same account being updated
      const duplicates = existingAccounts.docs.filter(doc => doc.id !== accountId);
      
      if (duplicates.length > 0) {
        throw new Error(`An account with the name "${data.name}" already exists. Please use a different name.`);
      }
    }
  }
  
  const docRef = doc(db, 'accounts', accountId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteAccount = async (accountId: string): Promise<void> => {
  await deleteDoc(doc(db, 'accounts', accountId));
};

// ============================================================================
// TRANSACTIONS (Accounting Module)
// ============================================================================

export const createTransaction = async (userId: string, transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const batch = writeBatch(db);

  // Create transaction
  const transactionRef = doc(collection(db, 'transactions'));
  batch.set(transactionRef, {
    ...transactionData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Update account balances
  for (const entry of transactionData.entries) {
    const accountRef = doc(db, 'accounts', entry.accountId);
    const accountSnap = await getDoc(accountRef);
    
    if (accountSnap.exists()) {
      const account = accountSnap.data() as Account;
      const balanceChange = entry.debit - entry.credit;
      
      batch.update(accountRef, {
        balance: account.balance + balanceChange,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  await batch.commit();
  return transactionRef.id;
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Transaction[];
};
