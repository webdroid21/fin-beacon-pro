import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { createDefaultAccounts } from './default-accounts';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '@/types';

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createOrUpdateUserProfile(result.user);
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign in with GitHub
 */
export const signInWithGithub = async (): Promise<UserCredential> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    await createOrUpdateUserProfile(result.user);
    return result;
  } catch (error) {
    console.error('Error signing in with GitHub:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createOrUpdateUserProfile(result.user, displayName);
    return result;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Create or update user profile in Firestore
 */
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
    await createDefaultAccounts(firebaseUser.uid); // ← Add this line
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

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};
