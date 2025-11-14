import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { SupportTicket, TicketMessage } from '@/types/support';

const TICKETS_COLLECTION = 'supportTickets';
const MESSAGES_COLLECTION = 'ticketMessages';

// Create a new support ticket
export const createSupportTicket = async (
  userId: string,
  userEmail: string,
  userName: string,
  ticketData: {
    subject: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    description: string;
  }
): Promise<string> => {
  try {
    const ticket: Omit<SupportTicket, 'ticketId'> = {
      userId,
      userEmail,
      userName,
      subject: ticketData.subject,
      category: ticketData.category,
      priority: ticketData.priority,
      status: 'open',
      description: ticketData.description,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, TICKETS_COLLECTION), ticket);
    
    // Add initial message
    await addTicketMessage(docRef.id, userId, userName, 'user', ticketData.description);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
};

// Get all tickets for a user
export const getUserTickets = async (userId: string): Promise<SupportTicket[]> => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      ticketId: doc.id,
    })) as SupportTicket[];
  } catch (error) {
    console.error('Error getting user tickets:', error);
    throw error;
  }
};

// Get all tickets (admin only)
export const getAllTickets = async (): Promise<SupportTicket[]> => {
  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      ticketId: doc.id,
    })) as SupportTicket[];
  } catch (error) {
    console.error('Error getting all tickets:', error);
    throw error;
  }
};

// Get a single ticket
export const getTicket = async (ticketId: string): Promise<SupportTicket | null> => {
  try {
    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        ticketId: docSnap.id,
      } as SupportTicket;
    }
    return null;
  } catch (error) {
    console.error('Error getting ticket:', error);
    throw error;
  }
};

// Add a message to a ticket
export const addTicketMessage = async (
  ticketId: string,
  senderId: string,
  senderName: string,
  senderRole: 'user' | 'admin',
  message: string,
  attachments?: string[]
): Promise<string> => {
  try {
    const messageData: Omit<TicketMessage, 'messageId'> = {
      ticketId,
      senderId,
      senderName,
      senderRole,
      message,
      attachments,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
    
    // Update ticket's updatedAt
    await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
      updatedAt: new Date().toISOString(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding ticket message:', error);
    throw error;
  }
};

// Get messages for a ticket
export const getTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('ticketId', '==', ticketId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      messageId: doc.id,
    })) as TicketMessage[];
  } catch (error) {
    console.error('Error getting ticket messages:', error);
    throw error;
  }
};

// Update ticket status
export const updateTicketStatus = async (
  ticketId: string,
  status: SupportTicket['status'],
  resolvedBy?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date().toISOString();
      if (resolvedBy) {
        updateData.resolvedBy = resolvedBy;
      }
    }

    await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), updateData);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

// Update ticket priority
export const updateTicketPriority = async (
  ticketId: string,
  priority: SupportTicket['priority']
): Promise<void> => {
  try {
    await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
      priority,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating ticket priority:', error);
    throw error;
  }
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      userId: doc.id,
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (
  userId: string,
  role: 'admin' | 'user'
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};
