import React, { useState, useCallback, useEffect } from 'react';
import VideoUploader from './VideoUploader';
import VideoPlayer from './VideoPlayer';
import ShareOptions from './ShareOptions';
import SettingsModal from './SettingsModal';
import VideoGallery from './VideoGallery';
import AskAiPanel from './AskAiPanel';
import { Logo } from './icons/Logo';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { TrashIcon } from './icons/TrashIcon';
import { User, authService, VideoData } from '../services/authService';
import { videoDBService } from '../services/videoDBService';

interface Settings {
  theme: 'light' | 'dark';
  loopVideo: boolean;
  cinemaMode: boolean;
}

interface MainAppProps {
    user: User;
    onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout }) => {
  const [videos, setVideos] = useState<VideoData[]>(user.videos);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('videoHubSettings');
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
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('videoHubSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Could not save settings to localStorage", error);
    }
  }, [settings]);

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


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 w-full">
            <div className="flex items-center gap-3">
              <Logo className="w-16 h-auto" />
              <h1 className="hidden sm:block text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                Video Hub
              </h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs" title={user.email}>{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back!</p>
                </div>
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
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <ShareOptions videoUrl={videoUrlForRender} fileName={selectedVideo.name} />
                    <AskAiPanel video={selectedVideo} />
                  </div>
                </div>
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={handleBackToGallery}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg shadow-cyan-500/20"
                  >
                    Back to Gallery
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
                    Delete Video
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
          <p>&copy; {new Date().getFullYear()} Video Hub. All rights reserved.</p>
        </footer>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        // FIX: The prop is 'onSettingsChange', not 'onSettings-change'.
        onSettingsChange={setSettings}
      />
    </div>
  );
};

export default MainApp;
