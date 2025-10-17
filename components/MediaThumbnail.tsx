import React, { useState, useEffect } from 'react';
import { MediaData, MediaType } from '../services/authService';
import { mediaDBService } from '../services/mediaDBService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';
import { MusicIcon } from './icons/MusicIcon';
import { ImageIcon } from './icons/ImageIcon';
import { FilmIcon } from './icons/FilmIcon';

// This helper function is specific to the thumbnail display logic.
const renderIcon = (mediaType: MediaType, className: string) => {
    switch (mediaType) {
        case 'audio': return <MusicIcon className={className} />;
        case 'image': return <ImageIcon className={className} />;
        case 'video':
        default: return <FilmIcon className={className} />;
    }
};

interface MediaThumbnailProps {
    mediaItem: MediaData;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ mediaItem, onSelect, onDelete }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        // The optimization of caching thumbnails in localStorage is already implemented.
        const thumbnailCacheKey = `thumbnail_${mediaItem.id}`;
        let objectUrl: string | null = null;

        const generateThumbnail = async () => {
            // 1. Check cache first for performance
            try {
                const cachedThumbnail = localStorage.getItem(thumbnailCacheKey);
                if (cachedThumbnail) {
                    if (isMounted) setThumbnailUrl(cachedThumbnail);
                    return;
                }
            } catch (e) {
                console.warn('Could not access localStorage for thumbnail cache.', e);
            }

            // 2. If not cached, retrieve the media blob from IndexedDB
            const blob = await mediaDBService.getMedia(mediaItem.id);
            if (!blob || !isMounted) return;

            // 3. Generate thumbnail based on media type
            if (mediaItem.mediaType === 'image') {
                objectUrl = URL.createObjectURL(blob);
                if (isMounted) setThumbnailUrl(objectUrl);
            } else if (mediaItem.mediaType === 'video') {
                const video = document.createElement('video');
                video.muted = true;
                video.playsInline = true;
                objectUrl = URL.createObjectURL(blob);
                video.src = objectUrl;

                // This is an efficient, browser-native method for frame capture.
                const captureFrame = () => {
                    if (!isMounted) return;
                    const canvas = document.createElement('canvas');
                    const aspectRatio = video.videoWidth / video.videoHeight || 16/9; // Fallback aspect ratio
                    canvas.width = 160;
                    canvas.height = 160 / aspectRatio;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        if (isMounted) setThumbnailUrl(dataUrl);
                        // 4. Cache the newly generated thumbnail in localStorage
                        try {
                            localStorage.setItem(thumbnailCacheKey, dataUrl);
                        } catch (e) {
                            console.warn("Could not cache thumbnail, storage might be full.", e);
                        }
                    }
                    if (objectUrl) URL.revokeObjectURL(objectUrl); // Clean up blob URL after use
                    objectUrl = null;
                };

                video.onseeked = captureFrame;
                video.onloadeddata = () => {
                    // Seek to 1 second or the middle of the video if it's shorter.
                    const seekTime = video.duration > 1 ? 1 : video.duration / 2;
                    video.currentTime = seekTime;
                };
                video.onerror = () => {
                    if (objectUrl) URL.revokeObjectURL(objectUrl);
                    if (isMounted) setThumbnailUrl('error'); // Use a string to indicate error state
                };
            } else {
                // For audio, we just show a placeholder icon.
                if (isMounted) setThumbnailUrl('audio_placeholder');
            }
        };

        generateThumbnail();

        // Cleanup function to revoke blob URLs and prevent memory leaks.
        return () => {
            isMounted = false;
            if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailUrl);
            }
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [mediaItem]); // Rerun effect if the media item changes

    // A visual thumbnail is one that is an actual image (dataURL or blob URL)
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
                // Render placeholder icon for audio or if an error occurred
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

export default MediaThumbnail;
