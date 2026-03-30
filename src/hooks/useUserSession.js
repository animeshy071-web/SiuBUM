import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export function useUserSession() {
  const [activeTheme, setActiveTheme] = useState(() => storage.getString('siuTheme', 'ben10'));
  const [user, setUser] = useState(() => storage.getObject('siuUser'));

  // Sync to storage
  useEffect(() => { storage.setString('siuTheme', activeTheme); }, [activeTheme]);

  const handleLogin = (userData) => {
    storage.setObject('siuUser', userData);
    setUser(userData);
  };

  const name = user?.name ?? '';
  const isLoggedIn = user !== null;

  return {
    activeTheme,
    setActiveTheme,
    user,
    name,
    isLoggedIn,
    handleLogin,
  };
}
