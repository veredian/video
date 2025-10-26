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
import { SparklesIcon } from './icons/SparklesIcon';
import MiniPlayer from './MiniPlayer';
import { TagIcon } from './icons/TagIcon';

interface MainAppProps {
    user: User;
    onLogout: () => void;
    settings: Settings;
    onSettingsChange: (newSettings: Settings) => void;
}

const THEMES: Settings['theme'][] = ['light', 'dark', 'sunset', 'ocean', 'space'];

interface SelectedMediaState {
    data: MediaData;
    initialTime?: number;
    autoPlay?: boolean;
}

interface MiniPlayerState {
    data: MediaData;
    currentTime: number;
    isPlaying: boolean;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, settings, onSettingsChange }) => {
  const { t } = useTranslation();
  const [media, setMedia] = useState<MediaData[]>(user.media);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMediaState | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'share' | 'ai'>('share');
  const [miniPlayerMedia, setMiniPlayerMedia] = useState<MiniPlayerState | null>(null);
  const [uploadAcceptType, setUploadAcceptType] = useState('video/*,audio/*,image/*');
  const [isSplitView, setIsSplitView] = useState(false);

  const handleInitiateUpload = (acceptType: string) => {
    setUploadAcceptType(acceptType);
    setIsUploading(true);
  };

  const handleMediaUpload = useCallback(async (mediaFile: File): Promise<() => void> => {
    const updatedUser = await authService.addMediaForCurrentUser(mediaFile);
    const newMedia = updatedUser.media[updatedUser.media.length - 1];
    
    return () => {
        setMedia(updatedUser.media);
        setSelectedMedia({ data: newMedia });
        setIsUploading(false);
        setUploadAcceptType('video/*,audio/*,image/*'); // Reset to default
    };
  }, []);

  const handleSelectMedia = useCallback((mediaItem: MediaData) => {
    setMiniPlayerMedia(null);
    setSelectedMedia({ data: mediaItem });
  }, []);

  const handleBackToGallery = useCallback(() => {
    setSelectedMedia(null);
    setIsSplitView(false);
  }, []);

  const handleToggleSplitView = useCallback(() => {
    if (selectedMedia) {
        setIsSplitView(prev => !prev);
    }
  }, [selectedMedia]);

  const handleDeleteMedia = useCallback(async (mediaId: string) => {
    try {
        const updatedUser = await authService.deleteMediaForCurrentUser(mediaId);
        setMedia(updatedUser.media);
        if(selectedMedia?.data.id === mediaId) {
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
    // For non-image media, default to the 'share' tab.
    // The image view no longer uses tabs.
    if (selectedMedia && selectedMedia.data.mediaType !== 'image') {
      setActiveInfoTab('share');
    }
  }, [selectedMedia]);

  useEffect(() => {
    if (!selectedMedia) {
      setMediaUrlForRender(null);
      return;
    }

    let objectUrl: string | null = null;
    let isMounted = true;

    const createUrl = async () => {
      try {
        const blob = await mediaDBService.getMedia(selectedMedia.data.id);
        if (isMounted && blob) {
            objectUrl = URL.createObjectURL(blob);
            setMediaUrlForRender(objectUrl);
        } else if (isMounted) {
            console.error(`Media with id ${selectedMedia.data.id} not found in DB.`);
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
    link.download = String(selectedMedia.data.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [mediaUrlForRender, selectedMedia]);

  const handleCycleTheme = () => {
    const currentIndex = THEMES.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    onSettingsChange({ ...settings, theme: THEMES[nextIndex] });
  };
  
  const handleMinimize = (currentTime: number, isPlaying: boolean) => {
    if (selectedMedia) {
        setMiniPlayerMedia({ data: selectedMedia.data, currentTime, isPlaying });
        setSelectedMedia(null);
    }
  };

  const handleRestoreMiniPlayer = (currentTime: number, isPlaying: boolean) => {
      if (miniPlayerMedia) {
          setSelectedMedia({ data: miniPlayerMedia.data, initialTime: currentTime, autoPlay: isPlaying });
          setMiniPlayerMedia(null);
      }
  };

  const handleCloseMiniPlayer = () => {
      setMiniPlayerMedia(null);
  };
  
  const handleLike = useCallback(async () => {
    if (!selectedMedia) return;
    try {
        const updatedUser = await authService.toggleLikeStatus(selectedMedia.data.id);
        setMedia(updatedUser.media);
        
        const updatedMediaItem = updatedUser.media.find(m => m.id === selectedMedia.data.id);
        if (updatedMediaItem) {
            setSelectedMedia(prev => prev ? { ...prev, data: updatedMediaItem } : null);
        }
    } catch (error) {
        console.error("Failed to update like status:", error);
        alert("There was an error liking the media. Please try again.");
    }
  }, [selectedMedia]);

  const handleShare = useCallback(async () => {
    if (!selectedMedia) return;

    let shareUrl = window.location.origin;
    if (!shareUrl || !shareUrl.startsWith('http')) {
      shareUrl = 'https://ai.google.dev/gemini-api';
    }

    const shareData = {
        title: selectedMedia.data.name,
        text: `Check out this media: ${selectedMedia.data.name}`,
        url: shareUrl,
    };
    
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Share failed:', err);
            setActiveInfoTab('share');
        }
    } else {
        setActiveInfoTab('share');
    }
  }, [selectedMedia]);


  const userIdentifier = user.email || user.phone || 'User';
  const watermarkText = settings.watermarkText || userIdentifier;

  const renderContent = () => {
    if (selectedMedia && mediaUrlForRender) {
        const uploadDate = new Date(parseInt(selectedMedia.data.id, 10));
        const simulatedViews = (parseInt(selectedMedia.data.id.slice(-4), 10) % 100) * 17 + 25; // pseudo-random views
        const isLiked = selectedMedia.data.liked;

        if (isSplitView && selectedMedia.data.mediaType !== 'image') {
          return (
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Player & Info */}
                <div className="lg:w-3/5 xl:w-2/3 flex flex-col gap-4">
                    <MediaPlayer 
                        key={selectedMedia.data.id}
                        src={mediaUrlForRender} 
                        mediaType={selectedMedia.data.mediaType}
                        fileName={selectedMedia.data.name}
                        mimeType={selectedMedia.data.type}
                        loop={settings.loopVideo} 
                        cinemaMode={settings.cinemaMode}
                        showWatermark={settings.showWatermark}
                        watermarkText={watermarkText}
                        defaultPlaybackSpeed={settings.defaultPlaybackSpeed}
                        performanceMode={settings.performanceMode}
                        onMinimize={handleMinimize}
                        initialTime={selectedMedia.initialTime}
                        autoPlay={selectedMedia.autoPlay}
                        onToggleSplitView={handleToggleSplitView}
                        isSplitView={isSplitView}
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white" title={selectedMedia.data.name}>
                          {selectedMedia.data.name}
                      </h2>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                              {simulatedViews.toLocaleString()} {t('gallery.views')} &bull; {uploadDate.toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105 ${
                                    isLiked
                                    ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/20'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                              >
                                <ThumbsUpIcon className="w-5 h-5" filled={isLiked} />
                                <span>{selectedMedia.data.likes.toLocaleString()}</span>
                              </button>
                              <button
                                  onClick={handleDownloadMedia}
                                  className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                              >
                                  <DownloadIcon className="w-5 h-5" />
                                  {t('main.download')}
                              </button>
                              <button
                                  onClick={handleShare}
                                  className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                              >
                                  <ShareIcon className="w-5 h-5" />
                                  {t('share.title')}
                              </button>
                              <button
                                  onClick={() => {
                                      if (window.confirm(t('main.confirmDelete'))) {
                                          handleDeleteMedia(selectedMedia.data.id);
                                      }
                                  }}
                                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 shadow-lg shadow-red-500/20"
                              >
                                  <TrashIcon className="w-5 h-5" />
                              </button>
                          </div>
                      </div>
                      {selectedMedia.data.tags && selectedMedia.data.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <TagIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            {selectedMedia.data.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
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
                                <ShareOptions mediaUrl={mediaUrlForRender} fileName={selectedMedia.data.name} mediaType={selectedMedia.data.mediaType} />
                            ) : (
                                <AskAiPanel media={selectedMedia.data} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Gallery */}
                <div className="lg:w-2/5 xl:w-1/3 max-h-[80vh] overflow-y-auto media-section-container rounded-lg p-4 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                    <MediaGallery 
                        media={media} 
                        onSelectMedia={handleSelectMedia} 
                        onUploadClick={() => handleInitiateUpload('video/*,audio/*,image/*')}
                        onUploadVideoClick={() => handleInitiateUpload('video/*')}
                        onDeleteMedia={handleDeleteMedia}
                        performanceMode={settings.performanceMode}
                    />
                </div>
            </div>
          );
        }
        
        if (selectedMedia.data.mediaType === 'image') {
          return (
             <div>
                <button
                    onClick={handleBackToGallery}
                    className="flex items-center gap-2 mb-4 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Back to gallery"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                    <span className="font-semibold">{t('main.backToGallery')}</span>
                </button>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Image */}
                    <div className="lg:w-2/3 xl:w-3/4">
                       <MediaPlayer 
                          key={selectedMedia.data.id}
                          src={mediaUrlForRender} 
                          mediaType={selectedMedia.data.mediaType}
                          fileName={selectedMedia.data.name}
                          mimeType={selectedMedia.data.type}
                          loop={settings.loopVideo} 
                          cinemaMode={settings.cinemaMode}
                          showWatermark={settings.showWatermark}
                          watermarkText={watermarkText}
                          defaultPlaybackSpeed={settings.defaultPlaybackSpeed}
                          performanceMode={settings.performanceMode}
                          onMinimize={handleMinimize}
                          initialTime={selectedMedia.initialTime}
                          autoPlay={selectedMedia.autoPlay}
                          onToggleSplitView={handleToggleSplitView}
                          isSplitView={isSplitView}
                      />
                    </div>
                     {/* Right Column: Info & AI */}
                    <div className="lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words" title={selectedMedia.data.name}>
                                {selectedMedia.data.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {simulatedViews.toLocaleString()} {t('gallery.views')} &bull; {uploadDate.toLocaleDateString()}
                            </p>
                        </div>

                        {selectedMedia.data.tags && selectedMedia.data.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <TagIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                {selectedMedia.data.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2">
                             <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105 ${
                                    isLiked
                                    ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/20'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                              >
                                <ThumbsUpIcon className="w-5 h-5" filled={isLiked} />
                                <span>{selectedMedia.data.likes.toLocaleString()}</span>
                              </button>
                              <button
                                  onClick={handleDownloadMedia}
                                  className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                              >
                                  <DownloadIcon className="w-5 h-5" />
                              </button>
                              <button
                                  onClick={() => {
                                      if (window.confirm(t('main.confirmDelete'))) {
                                          handleDeleteMedia(selectedMedia.data.id);
                                      }
                                  }}
                                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 shadow-lg shadow-red-500/20"
                              >
                                  <TrashIcon className="w-5 h-5" />
                              </button>
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <SparklesIcon className="w-6 h-6 text-cyan-400" />
                                {t('aiPanel.tabTitle')}
                            </h3>
                            <AskAiPanel media={selectedMedia.data} />
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <ShareIcon className="w-5 h-5" />
                                {t('share.tabTitle')}
                            </h3>
                            <ShareOptions mediaUrl={mediaUrlForRender} fileName={selectedMedia.data.name} mediaType={selectedMedia.data.mediaType} />
                        </div>
                    </div>
                </div>
            </div>
          );
        }

        // Default layout for Video/Audio
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
                          key={selectedMedia.data.id}
                          src={mediaUrlForRender} 
                          mediaType={selectedMedia.data.mediaType}
                          fileName={selectedMedia.data.name}
                          mimeType={selectedMedia.data.type}
                          loop={settings.loopVideo} 
                          cinemaMode={settings.cinemaMode}
                          showWatermark={settings.showWatermark}
                          watermarkText={watermarkText}
                          defaultPlaybackSpeed={settings.defaultPlaybackSpeed}
                          performanceMode={settings.performanceMode}
                          onMinimize={handleMinimize}
                          initialTime={selectedMedia.initialTime}
                          autoPlay={selectedMedia.autoPlay}
                          onToggleSplitView={handleToggleSplitView}
                          isSplitView={isSplitView}
                      />
                  </div>
              </div>

              <div className="mt-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white" title={selectedMedia.data.name}>
                      {selectedMedia.data.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                          {simulatedViews.toLocaleString()} {t('gallery.views')} &bull; {uploadDate.toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                          <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105 ${
                                isLiked
                                ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/20'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            <ThumbsUpIcon className="w-5 h-5" filled={isLiked} />
                            <span>{selectedMedia.data.likes.toLocaleString()}</span>
                          </button>
                          <button
                              onClick={handleDownloadMedia}
                              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                          >
                              <DownloadIcon className="w-5 h-5" />
                              {t('main.download')}
                          </button>
                          <button
                              onClick={handleShare}
                              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                          >
                              <ShareIcon className="w-5 h-5" />
                              {t('share.title')}
                          </button>
                          <button
                              onClick={() => {
                                  if (window.confirm(t('main.confirmDelete'))) {
                                      handleDeleteMedia(selectedMedia.data.id);
                                  }
                              }}
                              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 shadow-lg shadow-red-500/20"
                          >
                              <TrashIcon className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
                  {selectedMedia.data.tags && selectedMedia.data.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <TagIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        {selectedMedia.data.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                  )}
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
                        <ShareOptions mediaUrl={mediaUrlForRender} fileName={selectedMedia.data.name} mediaType={selectedMedia.data.mediaType} />
                    ) : (
                        <AskAiPanel media={selectedMedia.data} />
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
            onUploadClick={() => handleInitiateUpload('video/*,audio/*,image/*')}
            onUploadVideoClick={() => handleInitiateUpload('video/*')}
            onDeleteMedia={handleDeleteMedia}
            performanceMode={settings.performanceMode}
        />;
    }
    return <MediaUploader onMediaUpload={handleMediaUpload} accept={uploadAcceptType} />;
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans ${selectedMedia ? '' : 'justify-center'}`}>
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 w-full">
            <div className="flex items-center gap-3">
              <button onClick={handleBackToGallery} aria-label="Go to gallery view">
                <Logo className="w-16 h-auto" />
              </button>
              <h1 className="hidden sm:block text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                NV & NE ltd
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden md:block">
                  <LanguageSwitcher />
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs" title={userIdentifier}>{userIdentifier}</p>
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

        <main className={`${!selectedMedia || isSplitView ? 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 border border-gray-300 dark:border-gray-700' : ''}`}>
            <div key={selectedMedia ? selectedMedia.data.id : 'gallery'} className="opacity-0 animate-fade-in-up">
              {renderContent()}
            </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>{t('main.creator')}</p>
        </footer>
      </div>

      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-40 w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transform transition-transform duration-200"
        aria-label="Open help and about modal"
      >
        <QuestionMarkIcon className="w-8 h-8" />
      </button>

      {miniPlayerMedia && (
        <MiniPlayer
            key={miniPlayerMedia.data.id}
            media={miniPlayerMedia.data}
            initialTime={miniPlayerMedia.currentTime}
            isPlaying={miniPlayerMedia.isPlaying}
            onRestore={handleRestoreMiniPlayer}
            onClose={handleCloseMiniPlayer}
        />
      )}

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
