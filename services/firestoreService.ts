/**
 * Firestore Service - CRUD operations for CRM data
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    DocumentData,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Contact, OutreachTask, OutreachStatus, Priority } from '../types';

// Collection references
const contactsCollection = collection(db, 'contacts');
const tasksCollection = collection(db, 'outreachTasks');
const researchCollection = collection(db, 'research');

/**
 * Contact Operations
 */
export const contactsService = {
    async getAll(): Promise<Contact[]> {
        const snapshot = await getDocs(contactsCollection);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Contact[];
    },

    async getById(id: string): Promise<Contact | null> {
        const docRef = doc(contactsCollection, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() } as Contact;
    },

    async create(contact: Omit<Contact, 'id'>): Promise<Contact> {
        const id = crypto.randomUUID();
        const docRef = doc(contactsCollection, id);
        const contactData = {
            ...contact,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        await setDoc(docRef, contactData);
        return { id, ...contact };
    },

    async update(id: string, updates: Partial<Contact>): Promise<void> {
        const docRef = doc(contactsCollection, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(contactsCollection, id);
        await deleteDoc(docRef);
    },

    async bulkCreate(contacts: Omit<Contact, 'id'>[]): Promise<Contact[]> {
        const results: Contact[] = [];
        for (const contact of contacts) {
            const created = await this.create(contact);
            results.push(created);
        }
        return results;
    },
};

/**
 * Outreach Task Operations
 */
export const tasksService = {
    async getAll(): Promise<OutreachTask[]> {
        const snapshot = await getDocs(tasksCollection);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as OutreachTask[];
    },

    async getByStatus(status: OutreachStatus): Promise<OutreachTask[]> {
        const q = query(tasksCollection, where('status', '==', status));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as OutreachTask[];
    },

    async getByContactId(contactId: string): Promise<OutreachTask | null> {
        const q = query(tasksCollection, where('contactId', '==', contactId));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as OutreachTask;
    },

    async create(task: Omit<OutreachTask, 'id'>): Promise<OutreachTask> {
        const id = crypto.randomUUID();
        const docRef = doc(tasksCollection, id);
        const taskData = {
            ...task,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        await setDoc(docRef, taskData);
        return { id, ...task };
    },

    async updateStatus(id: string, status: OutreachStatus): Promise<void> {
        const docRef = doc(tasksCollection, id);
        await updateDoc(docRef, {
            status,
            updatedAt: Timestamp.now(),
            ...(status === OutreachStatus.Sent && { sentAt: Timestamp.now() }),
        });
    },

    async update(id: string, updates: Partial<OutreachTask>): Promise<void> {
        const docRef = doc(tasksCollection, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(tasksCollection, id);
        await deleteDoc(docRef);
    },
};

/**
 * Research Cache Operations
 */
export const researchService = {
    async getByContactId(contactId: string): Promise<{ notes: string; sources: Array<{ uri: string; title: string }> } | null> {
        const docRef = doc(researchCollection, contactId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        const expiresAt = data.expiresAt as Timestamp;

        // Check if cache is still valid
        if (expiresAt.toMillis() < Date.now()) {
            return null;
        }

        return {
            notes: data.notes,
            sources: data.sources || [],
        };
    },
};
