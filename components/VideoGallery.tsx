import React, { useState, useMemo, useEffect } from 'react';
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
import { useTranslation } from '../i18n/LanguageContext';
import { mediaDBService } from '../services/mediaDBService';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface MediaGalleryProps {
  media: MediaData[];
  onSelectMedia: (media: MediaData) => void;
  onUploadClick: () => void;
  onDeleteMedia: (mediaId: string) => void;
}

type SortKey = 'date' | 'name';
type SortDirection = 'asc' | 'desc';

const renderIcon = (mediaType: MediaType, className: string) => {
    switch (mediaType) {
        case 'audio': return <MusicIcon className={className} />;
        case 'image': return <ImageIcon className={className} />;
        case 'video':
        default: return <FilmIcon className={className} />;
    }
};

const MediaThumbnail: React.FC<{
    mediaItem: MediaData,
    onSelect: () => void,
    onDelete: (e: React.MouseEvent) => void,
}> = ({ mediaItem, onSelect, onDelete }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const thumbnailCacheKey = `thumbnail_${mediaItem.id}`;
        let objectUrl: string | null = null;

        const generateThumbnail = async () => {
            try {
                const cachedThumbnail = localStorage.getItem(thumbnailCacheKey);
                if (cachedThumbnail) {
                    if (isMounted) setThumbnailUrl(cachedThumbnail);
                    return;
                }
            } catch (e) {
                console.warn('Could not access localStorage for thumbnail cache.', e);
            }

            const blob = await mediaDBService.getMedia(mediaItem.id);
            if (!blob || !isMounted) return;

            if (mediaItem.mediaType === 'image') {
                objectUrl = URL.createObjectURL(blob);
                if (isMounted) setThumbnailUrl(objectUrl);
            } else if (mediaItem.mediaType === 'video') {
                const video = document.createElement('video');
                video.muted = true;
                video.playsInline = true;
                objectUrl = URL.createObjectURL(blob);
                video.src = objectUrl;

                const captureFrame = () => {
                    if (!isMounted) return;
                    const canvas = document.createElement('canvas');
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    canvas.width = 160;
                    canvas.height = 160 / aspectRatio;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        if (isMounted) setThumbnailUrl(dataUrl);
                        try {
                            localStorage.setItem(thumbnailCacheKey, dataUrl);
                        } catch (e) {
                            console.warn("Could not cache thumbnail, storage might be full.", e);
                        }
                    }
                    if (objectUrl) URL.revokeObjectURL(objectUrl);
                    objectUrl = null;
                };

                video.onseeked = captureFrame;
                video.onloadeddata = () => {
                    const seekTime = video.duration > 1 ? 1 : video.duration / 2;
                    video.currentTime = seekTime;
                };
                video.onerror = () => {
                    if (objectUrl) URL.revokeObjectURL(objectUrl);
                    if (isMounted) setThumbnailUrl('error');
                };
            } else {
                if (isMounted) setThumbnailUrl('audio_placeholder');
            }
        };

        generateThumbnail();

        return () => {
            isMounted = false;
            if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailUrl);
            }
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [mediaItem]);

    const isVisual = thumbnailUrl && !['audio_placeholder', 'error'].includes(thumbnailUrl);

    return (
        <div
            onClick={onSelect}
            className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer group overflow-hidden border border-gray-300 dark:border-gray-600 hover:border-cyan-500 hover:scale-105 transition-all duration-300 shadow-md"
        >
            <button
                onClick={onDelete}
                className="absolute top-1 right-1 z-20 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all"
                aria-label="Delete media"
            >
                <TrashIcon className="w-4 h-4" />
            </button>

            {!thumbnailUrl && <SpinnerIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />}
            {isVisual ? (
                <img src={thumbnailUrl} alt={mediaItem.name} className="w-full h-full object-cover" />
            ) : (
                thumbnailUrl && renderIcon(mediaItem.mediaType, "w-1/3 h-1/3 text-gray-500 dark:text-gray-400 group-hover:text-cyan-400")
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2">
                <p className="text-xs text-white font-medium truncate" title={mediaItem.name}>
                    {mediaItem.name}
                </p>
            </div>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};


const MediaGallery: React.FC<MediaGalleryProps> = ({ media, onSelectMedia, onUploadClick, onDeleteMedia }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc',
  });
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [durationFilter, setDurationFilter] = useState<string>('any');
  
  const DURATION_OPTIONS: Record<string, string> = {
    'any': t('gallery.durationAny'),
    '<1': t('gallery.durationShort'),
    '1-5': t('gallery.durationMedium'),
    '>5': t('gallery.durationLong'),
  };

  const handleDelete = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation(); // Prevent onSelectMedia from firing
    if (window.confirm(t('main.confirmDelete'))) {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('gallery.title')}</h2>
        <button
          onClick={onUploadClick}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
        >
          <PlusIcon className="w-5 h-5" />
          {t('gallery.uploadNew')}
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
              className="mt-6 flex sm:hidden mx-auto items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              <PlusIcon className="w-5 h-5" />
              {t('gallery.uploadNew')}
            </button>
        </div>
      ) : filteredAndSortedMedia.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <SearchIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('gallery.noResultsTitle')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('gallery.noResultsDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAndSortedMedia.map((item) => (
            <MediaThumbnail
                key={item.id}
                mediaItem={item}
                onSelect={() => onSelectMedia(item)}
                onDelete={(e) => handleDelete(e, item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
