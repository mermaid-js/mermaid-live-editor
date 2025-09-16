import type { UserModel } from '$/models/user.model';
import { env } from '$/util/env';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export async function getCurrentUser(): Promise<UserModel | null> {
  try {
    const response = await fetch(`${env.API_BASE_URL}/auth/profile`, {
      credentials: 'include'
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
