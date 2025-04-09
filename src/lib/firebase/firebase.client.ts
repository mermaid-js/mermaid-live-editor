import { env } from '$/util/env';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: env.apiKey,
  appId: env.appId,
  authDomain: env.authDomain,
  messagingSenderId: env.messagingSenderId,
  projectId: env.projectId,
  storageBucket: env.storageBucket
};

let app: FirebaseApp;
let firestoreDatabase: Firestore;

export function initializeFirebase(): void {
  console.log('Initializing Firebase with config:', firebaseConfig);
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
