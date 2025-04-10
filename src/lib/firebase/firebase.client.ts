import { env } from '$/util/env';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: env.apiKey,
  appId: env.appId,
  authDomain: env.authDomain,
  messagingSenderId: env.messagingSenderId,
  projectId: env.projectId,
  storageBucket: env.storageBucket
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
