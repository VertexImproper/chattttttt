import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const SESSION_KEY = 'chatpro_session';

export const saveSession = (data) => {
  try {
    storage.set(SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save session', e);
  }
};

export const getSession = () => {
  try {
    const data = storage.getString(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const clearSession = () => {
  storage.delete(SESSION_KEY);
};

export const isLoggedIn = () => {
  const session = getSession();
  return !!(session && session.sessionid);
};
