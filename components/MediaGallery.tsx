import React, { useState, useMemo } from 'react';
import { MediaData, MediaType } from '../services/authService';
import { FilmIcon } from './icons/FilmIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SearchIcon } from './icons/SearchIcon';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { MusicIcon } from './icons/MusicIcon';
import { ImageIcon } from './icons/ImageIcon';
import { FilterIcon } from './icons/FilterIcon';

interface MediaGalleryProps {
  media: MediaData[];
  onSelectMedia: (media: MediaData) => void;
  onUploadClick: () => void;
  onDeleteMedia: (mediaId: string) => void;
}

type SortKey = 'date' | 'name';
type SortDirection = 'asc' | 'desc';

const DURATION_OPTIONS: Record<string, string> = {
    'any': 'Any Duration',
    '<1': '< 1 min',
    '1-5': '1-5 min',
    '>5': '> 5 min',
};

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, onSelectMedia, onUploadClick, onDeleteMedia }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc',
  });
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [durationFilter, setDurationFilter] = useState<string>('any');

  const handleDelete = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation(); // Prevent onSelectMedia from firing
    if (window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
        onDeleteMedia(mediaId);
    }
  };

  const filteredAndSortedMedia = useMemo(() => {
    const filtered = media
      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(item => typeFilter === 'all' || item.mediaType === typeFilter)
      .filter(item => {
        if (durationFilter === 'any' || item.mediaType === 'image') return true;
        const duration = item.duration ?? 0;
        switch (durationFilter) {
          case '<1': return duration < 60;
          case '1-5': return duration >= 60 && duration <= 300;
          case '>5': return duration > 300;
          default: return true;
        }
      });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else { // date
        comparison = parseInt(a.id, 10) - parseInt(b.id, 10);
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [media, searchQuery, typeFilter, durationFilter, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : (key === 'date' ? 'desc' : 'asc'),
    }));
  };
  
  const toggleSortDirection = () => {
    setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const SortButton: React.FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey, children }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
        sortConfig.key === sortKey ? 'bg-cyan-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );

  const TypeFilterButton: React.FC<{ filter: MediaType | 'all', children: React.ReactNode }> = ({ filter, children }) => (
    <button
      onClick={() => setTypeFilter(filter)}
      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
        typeFilter === filter ? 'bg-cyan-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
  
  const renderIcon = (mediaType: MediaType, className: string) => {
    switch (mediaType) {
        case 'audio': return <MusicIcon className={className} />;
        case 'image': return <ImageIcon className={className} />;
        case 'video':
        default: return <FilmIcon className={className} />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Media Library</h2>
        <button
          onClick={onUploadClick}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
        >
          <PlusIcon className="w-5 h-5" />
          Upload New Media
        </button>
      </div>
      
      {media.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true">
              <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media by name..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              aria-label="Search media"
            />
          </div>
          <div className="flex flex-col xl:flex-row gap-4">
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
            <div className="flex-grow flex flex-col sm:flex-row items-center gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg border border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-1 p-1 flex-wrap justify-center">
                <FilterIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-2" />
                <TypeFilterButton filter="all">All</TypeFilterButton>
                <TypeFilterButton filter="video">Videos</TypeFilterButton>
                <TypeFilterButton filter="audio">Audio</TypeFilterButton>
                <TypeFilterButton filter="image">Images</TypeFilterButton>
              </div>
              <div className="relative flex items-center gap-1 p-1">
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md py-1.5 px-3 border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Filter by duration"
                  disabled={typeFilter === 'image'}
                >
                  {Object.entries(DURATION_OPTIONS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {media.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your gallery is empty</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Click the button below to get started and add your first media file.
          </p>
           <button
              onClick={onUploadClick}
              className="mt-6 flex sm:hidden mx-auto items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              <PlusIcon className="w-5 h-5" />
              Upload New Media
            </button>
        </div>
      ) : filteredAndSortedMedia.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <SearchIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">No Media Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Your search and filter criteria did not match any files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAndSortedMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectMedia(item)}
              className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer group overflow-hidden border border-gray-300 dark:border-gray-600 hover:border-cyan-500 transition-all duration-200"
            >
              <button
                onClick={(e) => handleDelete(e, item.id)}
                className="absolute top-1 right-1 z-20 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all duration-200"
                aria-label="Delete media"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
              {renderIcon(item.mediaType, "w-1/3 h-1/3 text-gray-500 dark:text-gray-400 group-hover:text-cyan-400 transition-colors")}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2">
                <p className="text-xs text-white font-medium truncate" title={item.name}>
                  {item.name}
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

export default MediaGallery;