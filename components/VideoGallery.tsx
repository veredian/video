import React, { useState, useMemo } from 'react';
import { MediaData, MediaType } from '../services/authService';
import { mediaDBService } from '../services/mediaDBService';
import MediaThumbnail from './MediaThumbnail';
import { PlusIcon } from './icons/PlusIcon';
import { SearchIcon } from './icons/SearchIcon';
import { SortAscIcon } from './icons/SortAscIcon';
import { SortDescIcon } from './icons/SortDescIcon';
import { FilterIcon } from './icons/FilterIcon';
import { XIcon } from './icons/XIcon';
import { useTranslation } from '../i18n/LanguageContext';
import { ImageIcon } from './icons/ImageIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FilmIcon } from './icons/FilmIcon';


interface MediaGalleryProps {
  media: MediaData[];
  onSelectMedia: (media: MediaData) => void;
  onUploadClick: () => void;
  onUploadVideoClick: () => void;
  onDeleteMedia: (mediaId: string) => void;
  performanceMode: boolean;
}

type SortKey = 'date' | 'name';
type SortDirection = 'asc' | 'desc';
type CategoryKey = 'movies' | 'videoClips' | 'musicLibrary' | 'imageGallery';


const MediaGallery: React.FC<MediaGalleryProps> = ({ media, onSelectMedia, onUploadClick, onUploadVideoClick, onDeleteMedia, performanceMode }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc',
  });
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [durationFilter, setDurationFilter] = useState<string>('any');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  const DURATION_OPTIONS: Record<string, string> = {
    'any': t('gallery.durationAny'),
    '<1': t('gallery.durationShort'),
    '1-5': t('gallery.durationMedium'),
    '>5': t('gallery.durationLong'),
  };

  const categoryTitles: Record<CategoryKey, string> = {
    movies: t('gallery.categoryMovies'),
    videoClips: t('gallery.categoryVideoClips'),
    musicLibrary: t('gallery.categoryMusic'),
    imageGallery: t('gallery.categoryImages'),
  };
  
  const isFiltered = useMemo(() => 
    searchQuery.length > 0 || typeFilter !== 'all' || durationFilter !== 'any', 
    [searchQuery, typeFilter, durationFilter]
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setDurationFilter('any');
  };

  const filteredAndSortedMedia = useMemo(() => {
    const filtered = media
      .filter(item => {
        const query = searchQuery.toLowerCase();
        if (!query) return true;
        
        const nameMatch = item.name.toLowerCase().includes(query);
        const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false;
        
        return nameMatch || tagMatch;
      })
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
        comparison = parseInt(b.id, 10) - parseInt(a.id, 10);
      }
      return sortConfig.direction === 'asc' ? -comparison : comparison;
    });
  }, [media, searchQuery, typeFilter, durationFilter, sortConfig]);

  const { groupedMedia, categoryOrder, totalItems } = useMemo(() => {
    const groups: Record<CategoryKey, MediaData[]> = {
      movies: [],
      videoClips: [],
      musicLibrary: [],
      imageGallery: [],
    };

    filteredAndSortedMedia.forEach(item => {
      if (item.mediaType === 'image') {
        groups.imageGallery.push(item);
      } else if (item.mediaType === 'audio') {
        groups.musicLibrary.push(item);
      } else if (item.mediaType === 'video') {
        if (item.duration && item.duration > 420) { // More than 7 minutes
          groups.movies.push(item);
        } else {
          groups.videoClips.push(item);
        }
      }
    });
    
    const order: CategoryKey[] = ['movies', 'videoClips', 'musicLibrary', 'imageGallery'];
    const total = Object.values(groups).reduce((acc, curr) => acc + curr.length, 0);

    return { groupedMedia: groups, categoryOrder: order, totalItems: total };
}, [filteredAndSortedMedia]);


  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : (key === 'date' ? 'desc' : 'asc'),
    }));
  };
  
  const toggleSortDirection = () => {
    setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
  };
  
  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedItems(new Set()); // Clear selections when toggling mode
  };
  
  const handleToggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        return newSelection;
    });
  };
  
  const allVisibleSelected = useMemo(() => 
    totalItems > 0 && selectedItems.size === totalItems,
    [selectedItems.size, totalItems]
  );

  const handleSelectAll = () => {
    if (allVisibleSelected) {
        setSelectedItems(new Set());
    } else {
        setSelectedItems(new Set(filteredAndSortedMedia.map(item => item.id)));
    }
  };
  
  const handleDeleteSelected = () => {
    const count = selectedItems.size;
    if (count === 0) return;
    if (window.confirm(t('gallery.confirmDeleteSelected', { count }))) {
        selectedItems.forEach(id => onDeleteMedia(id));
        setSelectedItems(new Set());
        setIsSelectMode(false);
    }
  };
  
  const handleDownloadSelected = async () => {
    if (selectedItems.size === 0) return;
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    for (const id of selectedItems) {
        try {
            const mediaItem = media.find(m => m.id === id);
            const blob = await mediaDBService.getMedia(id);
            if (mediaItem && blob) {
                const objectUrl = URL.createObjectURL(blob);
                link.href = objectUrl;
                link.download = String(mediaItem.name);
                link.click();
                await new Promise(resolve => setTimeout(resolve, 300));
                URL.revokeObjectURL(objectUrl);
            }
        } catch (error) {
            console.error(`Failed to download media with id ${id}:`, error);
        }
    }
    document.body.removeChild(link);
    setSelectedItems(new Set());
    setIsSelectMode(false);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('gallery.title')}</h2>
        <div className="flex items-center gap-2">
            {media.length > 0 && (
                <button
                    onClick={handleToggleSelectMode}
                    className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                    {isSelectMode ? t('gallery.cancel') : t('gallery.select')}
                </button>
            )}
             <button
              onClick={onUploadVideoClick}
              className={`hidden ${isSelectMode ? '' : 'sm:flex'} items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20`}
            >
              <FilmIcon className="w-5 h-5" />
              {t('gallery.uploadVideo')}
            </button>
            <button
              onClick={onUploadClick}
              className={`hidden ${isSelectMode ? '' : 'sm:flex'} items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-md transition-colors`}
            >
              <PlusIcon className="w-5 h-5" />
              {t('gallery.uploadNew')}
            </button>
        </div>
      </div>
      
      {isSelectMode && (
        <div className="bg-cyan-500/10 dark:bg-cyan-900/20 p-3 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up border border-cyan-500/20">
            <div className="flex items-center gap-4">
                <button onClick={handleSelectAll} className="font-semibold text-cyan-700 dark:text-cyan-300 hover:underline">
                    {allVisibleSelected ? t('gallery.deselectAll') : t('gallery.selectAll')}
                </button>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {t('gallery.itemsSelected', { count: selectedItems.size })}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleDownloadSelected} 
                    disabled={selectedItems.size === 0} 
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>{t('gallery.downloadSelected')}</span>
                </button>
                <button 
                    onClick={handleDeleteSelected} 
                    disabled={selectedItems.size === 0}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <TrashIcon className="w-5 h-5" />
                    <span>{t('gallery.deleteSelected')}</span>
                </button>
            </div>
        </div>
      )}

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
              placeholder={t('gallery.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              aria-label="Search media"
            />
          </div>
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg border border-gray-300 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 pl-2">{t('gallery.sortBy')}</span>
              <SortButton sortKey="date">{t('gallery.date')}</SortButton>
              <SortButton sortKey="name">{t('gallery.name')}</SortButton>
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
                <TypeFilterButton filter="all">{t('gallery.all')}</TypeFilterButton>
                <TypeFilterButton filter="video">{t('gallery.videos')}</TypeFilterButton>
                <TypeFilterButton filter="audio">{t('gallery.audio')}</TypeFilterButton>
                <TypeFilterButton filter="image">{t('gallery.images')}</TypeFilterButton>
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
              <div className="sm:ml-auto pr-1">
                {isFiltered && (
                    <button
                        onClick={handleClearFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title={t('gallery.clearFilters')}
                    >
                        <XIcon className="w-4 h-4" />
                        <span>{t('gallery.clearFilters')}</span>
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {media.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('gallery.emptyTitle')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('gallery.emptyDescription')}
          </p>
           <button
              onClick={onUploadClick}
              className="mt-6 flex sm:hidden mx-auto items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              <PlusIcon className="w-5 h-5" />
              {t('gallery.uploadNew')}
            </button>
        </div>
      ) : totalItems === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <SearchIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('gallery.noResultsTitle')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('gallery.noResultsDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
            {categoryOrder.map(categoryKey => {
                const items = groupedMedia[categoryKey];
                if (items.length === 0) return null;
                return (
                    <div key={categoryKey}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{categoryTitles[categoryKey]}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                            {items.map(item => (
                                 <MediaThumbnail
                                    key={item.id}
                                    mediaItem={item}
                                    onSelect={() => onSelectMedia(item)}
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(t('main.confirmDelete'))) {
                                            onDeleteMedia(item.id);
                                        }
                                    }}
                                    isSelectMode={isSelectMode}
                                    isSelected={selectedItems.has(item.id)}
                                    onToggleSelect={() => handleToggleItemSelection(item.id)}
                                    performanceMode={performanceMode}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
      )}
    </div>
  );
};

export default MediaGallery;