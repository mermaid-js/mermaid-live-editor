import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Configuration typée explicitement
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Clés triées par ordre alphabétique pour respecter sort-keys
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string
};

let app: FirebaseApp;
let firestoreDatabase: Firestore; // Nom plus descriptif

export function initializeFirebase(): void {
  if (!app) {
    app = initializeApp(firebaseConfig);
    firestoreDatabase = getFirestore(app);
  }
}

export function getFirestoreDatabase(): Firestore {
  if (!firestoreDatabase) {
    throw new Error('Firebase not initialized');
  }
  return firestoreDatabase;
}
