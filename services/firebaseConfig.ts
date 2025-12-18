/**
 * Firebase Configuration for Client-Side
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration - replace with your actual config from Firebase Console
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'crm-outreach-agent',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let functions: Functions;
let auth: Auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    functions = getFunctions(app);
    auth = getAuth(app);

    // Only connect to emulators if explicitly enabled via environment variable
    if (import.meta.env.VITE_USE_EMULATORS === 'true') {
        connectFunctionsEmulator(functions, 'localhost', 5001);
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('🔧 Using Firebase Emulators');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
}

export { app, db, functions, auth };
