import React, { useState, useMemo } from 'react';
// FIX: The type `VideoData` does not exist. It has been replaced by the more generic `MediaData`.
import { MediaData } from '../services/authService';
import { FilmIcon } from './icons/FilmIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SearchIcon } from './icons/SearchIcon';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';

interface VideoGalleryProps {
  // FIX: Using `MediaData` type to match what's available from `authService`.
  videos: MediaData[];
  // FIX: Using `MediaData` type to match what's available from `authService`.
  onSelectVideo: (video: MediaData) => void;
  onUploadClick: () => void;
  onDeleteVideo: (videoId: string) => void;
}

type SortKey = 'date' | 'name';
type SortDirection = 'asc' | 'desc';

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, onSelectVideo, onUploadClick, onDeleteVideo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc',
  });

  const handleDelete = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation(); // Prevent onSelectVideo from firing
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
        onDeleteVideo(videoId);
    }
  };

  const filteredVideos = useMemo(() => videos.filter(video =>
    video.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [videos, searchQuery]);

  const sortedVideos = useMemo(() => {
    const sortableVideos = [...filteredVideos];
    sortableVideos.sort((a, b) => {
        let comparison = 0;
        if (sortConfig.key === 'name') {
            comparison = a.name.localeCompare(b.name);
        } else { // date
            comparison = parseInt(a.id, 10) - parseInt(b.id, 10);
        }
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return sortableVideos;
  }, [filteredVideos, sortConfig]);

  const handleSort = (key: SortKey) => {
    if (sortConfig.key === key) {
        // If same key, just toggle direction
        setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
    } else {
        // If new key, set it and default direction
        setSortConfig({ key, direction: key === 'date' ? 'desc' : 'asc' });
    }
  };
  
  const toggleSortDirection = () => {
    setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const SortButton: React.FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey, children }) => {
    const isActive = sortConfig.key === sortKey;
    return (
        <button
            onClick={() => handleSort(sortKey)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                isActive 
                ? 'bg-cyan-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {children}
        </button>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Video Library</h2>
        <button
          onClick={onUploadClick}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
        >
          <PlusIcon className="w-5 h-5" />
          Upload New Video
        </button>
      </div>
      
      {videos.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos by name..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              aria-label="Search videos"
            />
          </div>
          <div className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg border border-gray-300 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 pl-2">Sort by:</span>
            <SortButton sortKey="date">Date</SortButton>
            <SortButton sortKey="name">Name</SortButton>
            <button
                onClick={toggleSortDirection}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                aria-label={`Sort ${sortConfig.direction === 'asc' ? 'descending' : 'ascending'}`}
            >
                {sortConfig.direction === 'asc' ? <SortAscIcon className="w-5 h-5" /> : <SortDescIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}


      {videos.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <FilmIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your gallery is empty</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Click the button below to get started and add your first video.
          </p>
           <button
              onClick={onUploadClick}
              className="mt-6 flex sm:hidden mx-auto items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              <PlusIcon className="w-5 h-5" />
              Upload New Video
            </button>
        </div>
      ) : sortedVideos.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <SearchIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">No Videos Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Your search for "<span className="font-semibold text-gray-700 dark:text-gray-300">{searchQuery}</span>" did not match any videos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedVideos.map((video) => (
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
