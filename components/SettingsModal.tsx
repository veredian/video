import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TagIcon } from './icons/TagIcon';
import { ClockIcon } from './icons/ClockIcon';
import { BanIcon } from './icons/BanIcon';
import { Settings } from '../App';
import { useTranslation } from '../i18n/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  onClearAllMedia: () => void;
}

const PLAYBACK_SPEED_OPTIONS = [1, 1.25, 1.5, 2];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, onClearAllMedia }) => {
  const { t } = useTranslation();

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

  const handleWatermarkChange = (enabled: boolean) => {
    onSettingsChange({ ...settings, showWatermark: enabled });
  };
  
  const handleSpeedChange = (speed: number) => {
    onSettingsChange({ ...settings, defaultPlaybackSpeed: speed });
  };

  const handleClearClick = () => {
    if (window.confirm(t('settings.confirmClearAll'))) {
        onClearAllMedia();
        onClose();
    }
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
          <h2 id="settings-title" className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h2>
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
              <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.darkMode')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.darkModeDesc')}</p>
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
              <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.loopMedia')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.loopMediaDesc')}</p>
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
                <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.cinemaMode')}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.cinemaModeDesc')}</p>
            </div>
            <ToggleSwitch 
              label="cinema-mode"
              enabled={settings.cinemaMode} 
              onChange={handleCinemaModeChange} 
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-cyan-400" />
                <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.showWatermark')}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.showWatermarkDesc')}</p>
            </div>
            <ToggleSwitch 
              label="show-watermark"
              enabled={settings.showWatermark} 
              onChange={handleWatermarkChange} 
            />
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-cyan-400" />
              <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.defaultPlaybackSpeed')}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('settings.defaultPlaybackSpeedDesc')}</p>
            <div className="flex items-center justify-around p-1 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                {PLAYBACK_SPEED_OPTIONS.map(speed => (
                    <button 
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                            settings.defaultPlaybackSpeed === speed 
                            ? 'bg-cyan-500 text-white' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {speed}x
                    </button>
                ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <BanIcon className="w-5 h-5 text-red-500" />
              <p className="font-medium text-gray-800 dark:text-gray-200">{t('settings.dataManagement')}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('settings.dataManagementDesc')}</p>
            <button
              onClick={handleClearClick}
              className="w-full flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 shadow-lg shadow-red-500/20"
            >
              {t('settings.clearAllMedia')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
