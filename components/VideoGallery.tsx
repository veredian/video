import React from 'react';
import { VideoData } from '../services/authService';
import { FilmIcon } from './icons/FilmIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface VideoGalleryProps {
  videos: VideoData[];
  onSelectVideo: (video: VideoData) => void;
  onUploadClick: () => void;
  onDeleteVideo: (videoId: string) => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, onSelectVideo, onUploadClick, onDeleteVideo }) => {
  const handleDelete = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation(); // Prevent onSelectVideo from firing
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
        onDeleteVideo(videoId);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Video Library</h2>
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
        >
          <PlusIcon className="w-5 h-5" />
          Upload New Video
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <FilmIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your gallery is empty</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Click 'Upload New Video' to get started and add your first video.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer group overflow-hidden border border-gray-300 dark:border-gray-600 hover:border-cyan-500 transition-all duration-200"
            >
              <button
                onClick={(e) => handleDelete(e, video.id)}
                className="absolute top-1 right-1 z-20 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all duration-200"
                aria-label="Delete video"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              <FilmIcon className="w-1/3 h-1/3 text-gray-500 dark:text-gray-400 group-hover:text-cyan-400 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2">
                <p className="text-xs text-white font-medium truncate" title={video.name}>
                  {video.name}
                </p>
              </div>
               <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
