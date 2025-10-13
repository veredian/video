import React, { useState, useCallback, useEffect } from 'react';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import { authService, User } from './services/authService';

const App: React.FC = () => {
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
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
    setHasEnteredApp(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };
  
  const handleEnter = () => {
    setHasEnteredApp(true);
  };

  // If a user is already logged in, show the main app directly
  if (currentUser) {
    return <MainApp user={currentUser} onLogout={handleLogout} />;
  }
  
  // If not logged in, show the home page first
  if (!hasEnteredApp) {
      return <HomePage onEnter={handleEnter} />;
  }

  // After entering from home page, show the auth page
  return <AuthPage onLogin={handleLogin} />;
};

export default App;