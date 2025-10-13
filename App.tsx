import React, { useState, useCallback, useEffect } from 'react';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import { authService, User } from './services/authService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('videoHubTheme');
      if (savedTheme) return JSON.parse(savedTheme);
    } catch (error) {
      console.error("Could not parse theme from localStorage", error);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('videoHubTheme', JSON.stringify(theme));
    } catch (error) {
      console.error("Could not save theme to localStorage", error);
    }
  }, [theme]);
  

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };
  
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <MainApp user={currentUser} onLogout={handleLogout} />;
};

export default App;