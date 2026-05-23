import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSession, clearSession, isLoggedIn as checkLoggedIn } from '../utils/session';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      const session = getSession();
      if (session && session.user) {
        setUser(session.user);
        setSessionId(session.sessionid);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (data) => {
    setUser(data.user);
    setSessionId(data.sessionid);
    setIsLoggedIn(true);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setSessionId(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, sessionId, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
