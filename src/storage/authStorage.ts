import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@tabletkioskapp:user_session';

export type UserRole = 'admin' | 'instrutor';

export type UserSession = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

export async function saveUserSession(session: UserSession): Promise<void> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export async function getUserSession(): Promise<UserSession | null> {
  const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as UserSession;
}

export async function removeUserSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}