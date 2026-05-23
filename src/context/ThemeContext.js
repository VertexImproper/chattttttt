import React, { createContext, useState, useContext, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';
import { themes } from '../themes';

const storage = new MMKV();
const THEME_KEY = 'chatpro_theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('spaceDark');

  useEffect(() => {
    const saved = storage.getString(THEME_KEY);
    if (saved && themes[saved]) {
      setThemeName(saved);
    }
  }, []);

  const setTheme = (name) => {
    if (themes[name]) {
      setThemeName(name);
      storage.set(THEME_KEY, name);
    }
  };

  const theme = themes[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
