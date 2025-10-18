import React, { useState, useCallback, useEffect } from 'react';
import MediaUploader from './VideoUploader';
import MediaPlayer from './MediaPlayer';
import ShareOptions from './ShareOptions';
import SettingsModal from './SettingsModal';
import MediaGallery from './VideoGallery';
import AskAiPanel from './AskAiPanel';
import HelpModal from './HelpModal';
import { Logo } from './icons/Logo';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { User, authService, MediaData } from '../services/authService';
import { mediaDBService } from '../services/mediaDBService';
import { Settings } from '../App';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n/LanguageContext';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ShareIcon } from './icons/ShareIcon';

interface MainAppProps {
    user: User;
    onLogout: () => void;
    settings: Settings;
    onSettingsChange: (newSettings: Settings) => void;
}

const THEMES: Settings['theme'][] = ['light', 'dark', 'sunset', 'ocean', 'space'];

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, settings, onSettingsChange }) => {
  const { t } = useTranslation();
  const [media, setMedia] = useState<MediaData[]>(user.media);
  const [selectedMedia, setSelectedMedia] = useState<MediaData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'share' | 'ai'>('share');

  const handleMediaUpload = useCallback(async (mediaFile: File) => {
    const updatedUser = await authService.addMediaForCurrentUser(mediaFile);
    const newMedia = updatedUser.media[updatedUser.media.length - 1];
    setMedia(updatedUser.media);
    setSelectedMedia(newMedia);
    setIsUploading(false);
  }, []);

  const handleSelectMedia = useCallback((mediaItem: MediaData) => {
    setSelectedMedia(mediaItem);
  }, []);

  const handleBackToGallery = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  const handleDeleteMedia = useCallback(async (mediaId: string) => {
    try {
        const updatedUser = await authService.deleteMediaForCurrentUser(mediaId);
        setMedia(updatedUser.media);
        if(selectedMedia?.id === mediaId) {
            setSelectedMedia(null);
        }
    } catch (error) {
        console.error("Failed to delete media:", error);
        alert("There was an error deleting the media. Please try again.");
    }
  }, [selectedMedia]);

  const handleClearAllMedia = useCallback(async () => {
    try {
        const updatedUser = await authService.clearAllMediaForCurrentUser();
        setMedia(updatedUser.media);
        setSelectedMedia(null);
    } catch (error) {
        console.error("Failed to clear all media:", error);
        alert("There was an error clearing your data. Please try again.");
    }
  }, []);
  
  const [mediaUrlForRender, setMediaUrlForRender] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMedia) {
      setMediaUrlForRender(null);
      return;
    }

    let objectUrl: string | null = null;
    let isMounted = true;

    const createUrl = async () => {
      try {
        const blob = await mediaDBService.getMedia(selectedMedia.id);
        if (isMounted && blob) {
            objectUrl = URL.createObjectURL(blob);
            setMediaUrlForRender(objectUrl);
        } else if (isMounted) {
            console.error(`Media with id ${selectedMedia.id} not found in DB.`);
            setMediaUrlForRender(null);
            alert("Error: Could not load media file. It may have been deleted.");
            setSelectedMedia(null);
        }
      } catch (error) {
        console.error("Error creating object URL for media", error);
        if (isMounted) {
            setMediaUrlForRender(null);
        }
      }
    };

    createUrl();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedMedia]);

  const handleDownloadMedia = useCallback(() => {
    if (!mediaUrlForRender || !selectedMedia) return;

    const link = document.createElement('a');
    link.href = mediaUrlForRender;
    link.download = String(selectedMedia.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [mediaUrlForRender, selectedMedia]);

  const handleCycleTheme = () => {
    const currentIndex = THEMES.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    onSettingsChange({ ...settings, theme: THEMES[nextIndex] });
  };

  const watermarkText = settings.watermarkText || user.email;

  const renderContent = () => {
    if (selectedMedia && mediaUrlForRender) {
        const uploadDate = new Date(parseInt(selectedMedia.id, 10));
        const simulatedViews = (parseInt(selectedMedia.id.slice(-4), 10) % 100) * 17 + 25; // pseudo-random views
        return (
            <div>
              <div className="mb-4">
                  <button
                      onClick={handleBackToGallery}
                      className="flex items-center gap-2 mb-4 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Back to gallery"
                  >
                      <ArrowLeftIcon className="w-6 h-6" />
                      <span className="font-semibold">{t('main.backToGallery')}</span>
                  </button>
                  <div className="w-full">
                      <MediaPlayer 
                          key={selectedMedia.id}
                          src={mediaUrlForRender} 
                          mediaType={selectedMedia.mediaType}
                          fileName={selectedMedia.name}
                          mimeType={selectedMedia.type}
                          loop={settings.loopVideo} 
                          cinemaMode={settings.cinemaMode}
                          showWatermark={settings.showWatermark}
                          watermarkText={watermarkText}
                          defaultPlaybackSpeed={settings.defaultPlaybackSpeed}
                          performanceMode={settings.performanceMode}
                      />
                  </div>
              </div>

              <div className="mt-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white" title={selectedMedia.name}>
                      {selectedMedia.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                          {simulatedViews.toLocaleString()} {t('gallery.views')} &bull; {uploadDate.toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                          <button className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200">
                            <ThumbsUpIcon className="w-5 h-5" />
                            <span>{t('gallery.like')}</span>
                          </button>
                          <button
                              onClick={handleDownloadMedia}
                              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                          >
                              <DownloadIcon className="w-5 h-5" />
                              {t('main.download')}
                          </button>
                          <button
                              onClick={() => setActiveInfoTab('share')}
                              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                          >
                              <ShareIcon className="w-5 h-5" />
                              {t('share.title')}
                          </button>
                          <button
                              onClick={() => {
                                  if (window.confirm(t('main.confirmDelete'))) {
                                      handleDeleteMedia(selectedMedia.id);
                                  }
                              }}
                              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 shadow-lg shadow-red-500/20"
                          >
                              <TrashIcon className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
              </div>

              <div className="mt-6">
                <div className="border-b border-gray-300 dark:border-gray-700 mb-4">
                    <button onClick={() => setActiveInfoTab('share')} className={`px-4 py-2 font-semibold transition-colors ${activeInfoTab === 'share' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-400'}`}>
                        {t('share.tabTitle')}
                    </button>
                    <button onClick={() => setActiveInfoTab('ai')} className={`px-4 py-2 font-semibold transition-colors ${activeInfoTab === 'ai' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-400'}`}>
                        {t('aiPanel.tabTitle')}
                    </button>
                </div>
                 <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg min-h-[200px]">
                    {activeInfoTab === 'share' ? (
                        <ShareOptions mediaUrl={mediaUrlForRender} fileName={selectedMedia.name} mediaType={selectedMedia.mediaType} />
                    ) : (
                        <AskAiPanel media={selectedMedia} />
                    )}
                 </div>
              </div>
            </div>
        );
    }
    if (media.length > 0 && !isUploading) {
        return <MediaGallery 
            media={media} 
            onSelectMedia={handleSelectMedia} 
            onUploadClick={() => setIsUploading(true)} 
            onDeleteMedia={handleDeleteMedia}
            performanceMode={settings.performanceMode}
        />;
    }
    return <MediaUploader onMediaUpload={handleMediaUpload} />;
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans ${selectedMedia ? '' : 'justify-center'}`}>
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 w-full">
            <div className="flex items-center gap-3">
              <Logo className="w-16 h-auto" />
              <h1 className="hidden sm:block text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                NV & NE ltd
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden md:block">
                  <LanguageSwitcher />
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs" title={user.email}>{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('main.welcomeBack')}</p>
                </div>
                 <button 
                    onClick={handleCycleTheme}
                    className="p-2 text-gray-500 hover:text-cyan-400 transition-colors duration-200"
                    aria-label="Change theme"
                >
                    <PaintBrushIcon className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-500 hover:text-cyan-400 transition-colors duration-200"
                    aria-label="Open settings"
                >
                    <SettingsIcon className="w-6 h-6" />
                </button>
                <button 
                    onClick={onLogout}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                    aria-label="Logout"
                >
                    <LogoutIcon className="w-6 h-6" />
                </button>
            </div>
        </header>

        <main className={`${selectedMedia ? '' : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 border border-gray-300 dark:border-gray-700'}`}>
            <div key={selectedMedia ? selectedMedia.id : 'gallery'} className="opacity-0 animate-fade-in-up">
              {renderContent()}
            </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>{t('main.creator')}</p>
        </footer>
      </div>

      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transform transition-transform duration-200"
        aria-label="Open help and about modal"
      >
        <QuestionMarkIcon className="w-8 h-8" />
      </button>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
        onClearAllMedia={handleClearAllMedia}
      />
      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default MainApp;
