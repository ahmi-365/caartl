import React, { createContext, useContext, useState } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark', // default is dark
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark'); // set default theme to 'dark'

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
