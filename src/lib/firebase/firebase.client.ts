import type { UserModel } from '$/models/user.model';

await getCurrentUser();

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export async function getCurrentUser(): Promise<UserModel | null> {
  try {
    const response = await fetch('http://localhost:3001/api/auth/profile', {
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
