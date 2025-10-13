import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface Settings {
  theme: 'light' | 'dark';
  loopVideo: boolean;
  cinemaMode: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) {
    return null;
  }

  const handleThemeChange = (enabled: boolean) => {
    onSettingsChange({ ...settings, theme: enabled ? 'dark' : 'light' });
  };

  const handleLoopChange = (enabled: boolean) => {
    onSettingsChange({ ...settings, loopVideo: enabled });
  };
  
  const handleCinemaModeChange = (enabled: boolean) => {
    onSettingsChange({ ...settings, cinemaMode: enabled });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="relative w-full max-w-md m-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="settings-title" className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full transition-colors"
            aria-label="Close settings"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reduce glare and improve night viewing.</p>
            </div>
            <ToggleSwitch 
              label="dark-mode"
              enabled={settings.theme === 'dark'} 
              onChange={handleThemeChange} 
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Loop Video</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically replay the video when it ends.</p>
            </div>
            <ToggleSwitch 
              label="loop-video"
              enabled={settings.loopVideo} 
              onChange={handleLoopChange} 
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-cyan-400" />
                <p className="font-medium text-gray-800 dark:text-gray-200">Cinema Mode</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Creates an immersive background glow.</p>
            </div>
            <ToggleSwitch 
              label="cinema-mode"
              enabled={settings.cinemaMode} 
              onChange={handleCinemaModeChange} 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;