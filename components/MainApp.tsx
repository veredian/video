import React, { useState, useCallback, useEffect } from 'react';
import VideoUploader from './VideoUploader';
import VideoPlayer from './VideoPlayer';
import ShareOptions from './ShareOptions';
import SettingsModal from './SettingsModal';
import VideoGallery from './VideoGallery';
import AskAiPanel from './AskAiPanel';
import HelpModal from './HelpModal';
import { Logo } from './icons/Logo';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { User, authService, VideoData } from '../services/authService';
import { videoDBService } from '../services/videoDBService';
import { Settings } from '../App';

interface MainAppProps {
    user: User;
    onLogout: () => void;
    settings: Settings;
    onSettingsChange: (newSettings: Settings) => void;
}

const THEMES: Settings['theme'][] = ['light', 'dark', 'sunset', 'ocean', 'space'];

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, settings, onSettingsChange }) => {
  const [videos, setVideos] = useState<VideoData[]>(user.videos);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleVideoUpload = useCallback(async (videoFile: File) => {
    const updatedUser = await authService.addVideoForCurrentUser(videoFile);
    const newVideo = updatedUser.videos[updatedUser.videos.length - 1];
    setVideos(updatedUser.videos);
    setSelectedVideo(newVideo);
    setIsUploading(false);
  }, []);

  const handleSelectVideo = useCallback((video: VideoData) => {
    setSelectedVideo(video);
  }, []);

  const handleBackToGallery = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  const handleDeleteVideo = useCallback(async (videoId: string) => {
    try {
        const updatedUser = await authService.deleteVideoForCurrentUser(videoId);
        setVideos(updatedUser.videos);
        // If the deleted video was the one being viewed, go back to the gallery
        if(selectedVideo?.id === videoId) {
            setSelectedVideo(null);
        }
    } catch (error) {
        console.error("Failed to delete video:", error);
        alert("There was an error deleting the video. Please try again.");
    }
  }, [selectedVideo]);
  
  const [videoUrlForRender, setVideoUrlForRender] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVideo) {
      setVideoUrlForRender(null);
      return;
    }

    let objectUrl: string | null = null;
    let isMounted = true;

    const createUrl = async () => {
      try {
        const blob = await videoDBService.getVideo(selectedVideo.id);
        if (isMounted && blob) {
            objectUrl = URL.createObjectURL(blob);
            setVideoUrlForRender(objectUrl);
        } else if (isMounted) {
            console.error(`Video with id ${selectedVideo.id} not found in DB.`);
            setVideoUrlForRender(null);
        }
      } catch (error) {
        console.error("Error creating object URL for video", error);
        if (isMounted) {
            setVideoUrlForRender(null);
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
  }, [selectedVideo]);

  const handleDownloadVideo = useCallback(() => {
    if (!videoUrlForRender || !selectedVideo) return;

    const link = document.createElement('a');
    link.href = videoUrlForRender;
    link.download = selectedVideo.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [videoUrlForRender, selectedVideo]);

  const handleCycleTheme = () => {
    const currentIndex = THEMES.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    onSettingsChange({ ...settings, theme: THEMES[nextIndex] });
  };

  const watermarkText = "Eric and mackson";

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 w-full">
            <div className="flex items-center gap-3">
              <Logo className="w-16 h-auto" />
              <h1 className="hidden sm:block text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                NV & NE ltd
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs" title={user.email}>{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back!</p>
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

        <main className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 border border-gray-300 dark:border-gray-700">
          {selectedVideo && videoUrlForRender ? (
             <div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 w-full">
                    <VideoPlayer 
                      key={selectedVideo.id} // Ensure component remounts on video change
                      src={videoUrlForRender} 
                      loop={settings.loopVideo} 
                      cinemaMode={settings.cinemaMode}
                      showWatermark={settings.showWatermark}
                      watermarkText={watermarkText}
                      defaultPlaybackSpeed={settings.defaultPlaybackSpeed}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <ShareOptions videoUrl={videoUrlForRender} fileName={selectedVideo.name} />
                    <AskAiPanel video={selectedVideo} />
                  </div>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
                  <button
                    onClick={handleBackToGallery}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg shadow-cyan-500/20"
                  >
                    Back to Gallery
                  </button>
                  <button
                    onClick={handleDownloadVideo}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg shadow-gray-500/20"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    Download
                  </button>
                   <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
                            handleDeleteVideo(selectedVideo.id);
                        }
                    }}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg shadow-red-500/20"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Delete
                  </button>
                </div>
             </div>
          ) : videos.length > 0 && !isUploading ? (
             <VideoGallery videos={videos} onSelectVideo={handleSelectVideo} onUploadClick={() => setIsUploading(true)} onDeleteVideo={handleDeleteVideo} />
          ) : (
            <VideoUploader onVideoUpload={handleVideoUpload} />
          )}
        </main>
        
        <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>Made by Mackson</p>
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
      />
      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default MainApp;