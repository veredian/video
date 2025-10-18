import React, { useState, useEffect, useMemo } from 'react';
import { MediaData, MediaType } from '../services/authService';
import { mediaDBService } from '../services/mediaDBService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';
import { MusicIcon } from './icons/MusicIcon';
import { ImageIcon } from './icons/ImageIcon';
import { FilmIcon } from './icons/FilmIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CircleIcon } from './icons/CircleIcon';
import { useTranslation } from '../i18n/LanguageContext';

const renderIcon = (mediaType: MediaType, className: string) => {
    switch (mediaType) {
        case 'audio': return <MusicIcon className={className} />;
        case 'image': return <ImageIcon className={className} />;
        case 'video':
        default: return <FilmIcon className={className} />;
    }
};

const formatRelativeTime = (timestamp: number, t: (key: string, options?: any) => string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return t('gallery.yearsAgo', { count: Math.floor(interval) });
    interval = seconds / 2592000;
    if (interval > 1) return t('gallery.monthsAgo', { count: Math.floor(interval) });
    interval = seconds / 86400;
    if (interval > 1) return t('gallery.daysAgo', { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t('gallery.hoursAgo', { count: Math.floor(interval) });
    interval = seconds / 60;
    if (interval > 1) return t('gallery.minutesAgo', { count: Math.floor(interval) });
    return t('gallery.justNow');
};


interface MediaThumbnailProps {
    mediaItem: MediaData;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
    isSelectMode: boolean;
    isSelected: boolean;
    onToggleSelect: () => void;
    performanceMode: boolean;
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ 
    mediaItem, onSelect, onDelete, isSelectMode, isSelected, onToggleSelect, performanceMode 
}) => {
    const { t } = useTranslation();
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const thumbnailCacheKey = `thumbnail_${mediaItem.id}_${performanceMode ? 'perf' : 'qual'}`;
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
                    const aspectRatio = video.videoWidth / video.videoHeight || 16/9;
                    canvas.width = 160;
                    canvas.height = 160 / aspectRatio;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const quality = performanceMode ? 0.4 : 0.7;
                        const dataUrl = canvas.toDataURL('image/jpeg', quality);
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
    }, [mediaItem, performanceMode]);

    const isVisual = thumbnailUrl && !['audio_placeholder', 'error'].includes(thumbnailUrl);

    const metadata = useMemo(() => {
        const simulatedViews = (parseInt(mediaItem.id.slice(-4), 10) % 100) * 17 + 25; // pseudo-random views
        const relativeTime = formatRelativeTime(parseInt(mediaItem.id, 10), t);
        return `${simulatedViews.toLocaleString()} ${t('gallery.views')} • ${relativeTime}`;
    }, [mediaItem.id, t]);

    return (
        <div 
            onClick={isSelectMode ? onToggleSelect : onSelect}
            className="flex flex-col cursor-pointer group"
        >
            <div
                className={`relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-center overflow-hidden transition-transform duration-300 shadow-md ${
                    isSelected ? 'scale-105 ring-2 ring-cyan-500' : 'group-hover:scale-105'
                }`}
            >
                {!isSelectMode && (
                    <button
                        onClick={onDelete}
                        className="absolute top-1 right-1 z-20 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all"
                        aria-label="Delete media"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}

                {isSelectMode && (
                    <div className="absolute top-2 left-2 z-20 text-white bg-black/30 rounded-full" aria-hidden="true">
                        {isSelected ? 
                            <CheckCircleIcon className="w-6 h-6 text-cyan-400 bg-white rounded-full" /> : 
                            <CircleIcon className="w-6 h-6" />
                        }
                    </div>
                )}
                
                {isSelected && <div className="absolute inset-0 bg-cyan-500/30" aria-hidden="true"></div>}

                {!thumbnailUrl && <SpinnerIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />}
                
                {isVisual ? (
                    <img src={thumbnailUrl} alt={mediaItem.name} className="w-full h-full object-cover" />
                ) : (
                    thumbnailUrl && renderIcon(mediaItem.mediaType, "w-1/3 h-1/3 text-gray-500 dark:text-gray-400")
                )}
            </div>

            <div className="mt-2 pr-2">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={mediaItem.name}>
                    {mediaItem.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{metadata}</p>
            </div>
        </div>
    );
};

export default MediaThumbnail;
