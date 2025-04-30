import type { UserModel } from '$/models/user.model';
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
await getCurrentUser();

export default db;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export async function getCurrentUser(): Promise<UserModel | null> {
  try {
    const response = await fetch('http://localhost:3000/api/profile', {
      credentials: 'include' // Ensure cookies are sent with the request
    });

    if (!response.ok) {
      // window.location = 'http://localhost:4200/login';
    }

    const user = (await response.json()) as UserModel;
    console.log('CurrentUser', user);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
