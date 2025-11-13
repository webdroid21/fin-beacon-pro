import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadMetadata,
  type UploadTask,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (
  file: File,
  path: string,
  metadata?: UploadMetadata
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload a file with progress tracking
 */
export const uploadFileWithProgress = (
  file: File,
  path: string,
  onProgress: (progress: number) => void,
  metadata?: UploadMetadata
): UploadTask => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    },
    (error) => {
      console.error('Error during upload:', error);
    }
  );

  return uploadTask;
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get download URL for a file
 */
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

/**
 * Upload user profile image
 */
export const uploadProfileImage = async (
  userId: string,
  file: File
): Promise<string> => {
  const path = `users/${userId}/profile/${file.name}`;
  return uploadFile(file, path, {
    contentType: file.type,
  });
};

/**
 * Upload business logo
 */
export const uploadBusinessLogo = async (
  userId: string,
  file: File
): Promise<string> => {
  const path = `users/${userId}/business/logo/${file.name}`;
  return uploadFile(file, path, {
    contentType: file.type,
  });
};

/**
 * Upload invoice attachment
 */
export const uploadInvoiceAttachment = async (
  userId: string,
  invoiceId: string,
  file: File
): Promise<string> => {
  const path = `users/${userId}/invoices/${invoiceId}/attachments/${file.name}`;
  return uploadFile(file, path, {
    contentType: file.type,
  });
};

/**
 * Upload invoice PDF
 */
export const uploadInvoicePDF = async (
  userId: string,
  invoiceId: string,
  pdfBlob: Blob
): Promise<string> => {
  const path = `users/${userId}/invoices/${invoiceId}/invoice.pdf`;
  return uploadFile(pdfBlob as File, path, {
    contentType: 'application/pdf',
  });
};

/**
 * Upload expense receipt
 */
export const uploadExpenseReceipt = async (
  userId: string,
  expenseId: string,
  file: File
): Promise<string> => {
  const path = `users/${userId}/expenses/${expenseId}/receipt/${file.name}`;
  return uploadFile(file, path, {
    contentType: file.type,
  });
};
