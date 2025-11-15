import React, { useState, useCallback, useEffect } from 'react';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import Onboarding from './components/onboarding/Onboarding';
import { authService, User } from './services/authService';

export interface Settings {
  theme: 'light' | 'dark' | 'sunset' | 'ocean' | 'space';
  loopVideo: boolean;
  cinemaMode: boolean;
  showWatermark: boolean;
  watermarkText: string;
  defaultPlaybackSpeed: number;
  performanceMode: boolean;
}

const THEMES: Settings['theme'][] = ['light', 'dark', 'sunset', 'ocean', 'space'];
const THEME_CLASSES: Record<Settings['theme'], string> = {
    light: 'bg-gray-100',
    dark: 'bg-black',
    sunset: 'theme-sunset',
    ocean: 'theme-ocean',
    space: 'theme-space',
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      // Show onboarding if it's not marked as completed
      return localStorage.getItem('hasCompletedOnboarding') !== 'true';
    } catch {
      return true; // Default to showing onboarding if localStorage fails
    }
  });
  
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('NVNELtdSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return {
          theme: parsed.theme || 'light',
          loopVideo: parsed.loopVideo !== undefined ? parsed.loopVideo : true,
          cinemaMode: parsed.cinemaMode !== undefined ? parsed.cinemaMode : true,
          showWatermark: parsed.showWatermark !== undefined ? parsed.showWatermark : true,
          watermarkText: parsed.watermarkText || '',
          defaultPlaybackSpeed: parsed.defaultPlaybackSpeed || 1,
          performanceMode: parsed.performanceMode !== undefined ? parsed.performanceMode : false,
        };
      }
    } catch (error) {
      console.error("Could not parse settings from localStorage", error);
    }
    return {
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      loopVideo: true,
      cinemaMode: true,
      showWatermark: true,
      watermarkText: '',
      defaultPlaybackSpeed: 1,
      performanceMode: false,
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
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };
  
  const handleOnboardingComplete = () => {
    try {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        // Clean up the step tracking as it's no longer needed
        localStorage.removeItem('onboardingStep');
    } catch (error) {
        console.error("Could not save onboarding status to localStorage", error);
    }
    setShowOnboarding(false);
  };

  if (currentUser) {
    return <MainApp user={currentUser} onLogout={handleLogout} settings={settings} onSettingsChange={setSettings} />;
  }
  
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }
  
  return <AuthPage onLogin={handleLogin} />;
};

export default App;