import React, { useState, useCallback, useEffect } from 'react';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import { authService, User } from './services/authService';

export interface Settings {
  theme: 'light' | 'dark' | 'sunset' | 'ocean' | 'space';
  loopVideo: boolean;
  cinemaMode: boolean;
}

const THEMES: Settings['theme'][] = ['light', 'dark', 'sunset', 'ocean', 'space'];
const THEME_CLASSES: Record<Settings['theme'], string> = {
    light: 'bg-gray-100',
    dark: 'bg-gray-900',
    sunset: 'theme-sunset',
    ocean: 'theme-ocean',
    space: 'theme-space',
};

const App: React.FC = () => {
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('NVNELtdSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return {
          theme: parsed.theme || 'light',
          loopVideo: parsed.loopVideo !== undefined ? parsed.loopVideo : true,
          cinemaMode: parsed.cinemaMode !== undefined ? parsed.cinemaMode : true,
        };
      }
    } catch (error) {
      console.error("Could not parse settings from localStorage", error);
    }
    return {
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      loopVideo: true,
      cinemaMode: true,
    };
  });

  useEffect(() => {
    // For Tailwind's dark mode selectors (e.g., dark:bg-gray-800)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // For body background
    // Remove all possible theme classes from body to prevent conflicts
    Object.values(THEME_CLASSES).forEach(className => {
        document.body.classList.remove(className);
    });

    // Add current theme class
    const currentThemeClass = THEME_CLASSES[settings.theme];
    if (currentThemeClass) {
        document.body.classList.add(currentThemeClass);
    } else {
        document.body.classList.add(THEME_CLASSES.light); // Fallback to light theme
    }

    // Persist settings
    try {
      localStorage.setItem('NVNELtdSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Could not save settings to localStorage", error);
    }
  }, [settings]);

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
    return <MainApp user={currentUser} onLogout={handleLogout} settings={settings} onSettingsChange={setSettings} />;
  }
  
  // If not logged in, show the home page first
  if (!hasEnteredApp) {
      return <HomePage onEnter={handleEnter} />;
  }

  // After entering from home page, show the auth page
  return <AuthPage onLogin={handleLogin} />;
};

export default App;