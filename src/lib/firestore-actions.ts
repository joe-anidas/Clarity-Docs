'use client';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';

// Simple in-memory cache for document history
const documentCache = new Map<string, { data: DocumentHistory[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface DocumentHistory {
  id?: string;
  userId: string;
  documentName: string;
  documentType?: string;
  content: string; // The full document text
  summary?: any; // The AI-generated summary
  uploadedAt: Date;
  fileType?: string; // 'pdf', 'image', 'text'
  fileSize?: number;
}

/**
 * Save a document to the user's history
 */
export async function saveDocumentToHistory(
  userId: string,
  documentData: Omit<DocumentHistory, 'id' | 'userId' | 'uploadedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'documentHistory'), {
      userId,
      ...documentData,
      uploadedAt: Timestamp.now(),
    });
    
    // Invalidate cache when new document is added
    documentCache.delete(userId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving document to history:', error);
    throw new Error('Failed to save document to history');
  }
}

/**
 * Get all documents for a specific user, sorted by most recent (with caching)
 */
export async function getUserDocumentHistory(
  userId: string,
  limitCount: number = 50,
  forceRefresh: boolean = false
): Promise<DocumentHistory[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = documentCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached document history for userId:', userId);
        return cached.data;
      }
    }

    console.log('Fetching document history for userId:', userId);

    const q = query(
      collection(db, 'documentHistory'),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const documents: DocumentHistory[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        userId: data.userId,
        documentName: data.documentName,
        documentType: data.documentType,
        content: data.content,
        summary: data.summary,
        uploadedAt: data.uploadedAt.toDate(),
        fileType: data.fileType,
        fileSize: data.fileSize,
      });
    });

    // Cache the results
    documentCache.set(userId, { data: documents, timestamp: Date.now() });

    console.log('Successfully fetched', documents.length, 'documents');
    return documents;
  } catch (error: any) {
    console.error('Error fetching document history:', error);
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please ensure you are signed in.');
    }
    if (error?.message?.includes('Missing or insufficient permissions')) {
      throw new Error('Permission denied. Please sign out and sign in again.');
    }
    
    throw new Error(error?.message || 'Failed to fetch document history');
  }
}

/**
 * Delete a document from history
 */
export async function deleteDocumentFromHistory(
  documentId: string,
  userId?: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'documentHistory', documentId));
    
    // Invalidate cache when document is deleted
    if (userId) {
      documentCache.delete(userId);
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Update an existing document in history
 */
export async function updateDocumentInHistory(
  documentId: string,
  documentData: Partial<Omit<DocumentHistory, 'id' | 'userId' | 'uploadedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'documentHistory', documentId);
    await updateDoc(docRef, {
      ...documentData,
      uploadedAt: Timestamp.now(), // Update timestamp when editing
    });
    console.log('Document updated successfully:', documentId);
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Failed to update document');
  }
}

/**
 * Get recent documents (last 10)
 */
export async function getRecentDocuments(userId: string): Promise<DocumentHistory[]> {
  return getUserDocumentHistory(userId, 10);
}
