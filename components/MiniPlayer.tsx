import React, { useState, useEffect, useRef } from 'react';
import { MediaData } from '../services/authService';
import { mediaDBService } from '../services/mediaDBService';
import { MusicIcon } from './icons/MusicIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { XIcon } from './icons/XIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface MiniPlayerProps {
    media: MediaData;
    initialTime: number;
    isPlaying: boolean;
    onRestore: (currentTime: number, isPlaying: boolean) => void;
    onClose: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ media, initialTime, isPlaying, onRestore, onClose }) => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(isPlaying);
    const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        let isMounted = true;

        const getUrl = async () => {
            try {
                const blob = await mediaDBService.getMedia(media.id);
                if (isMounted && blob) {
                    objectUrl = URL.createObjectURL(blob);
                    setMediaUrl(objectUrl);
                }
            } catch (error) {
                console.error("Error loading media for mini-player:", error);
            }
        };

        getUrl();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [media.id]);

    useEffect(() => {
        const mediaElement = mediaRef.current;
        if (!mediaElement || !mediaUrl) return;

        const onPlay = () => setIsCurrentlyPlaying(true);
        const onPause = () => setIsCurrentlyPlaying(false);

        mediaElement.addEventListener('play', onPlay);
        mediaElement.addEventListener('pause', onPause);

        mediaElement.currentTime = initialTime;
        if (isPlaying) {
            mediaElement.play().catch(console.error);
        }

        return () => {
            mediaElement.removeEventListener('play', onPlay);
            mediaElement.removeEventListener('pause', onPause);
        };
    }, [mediaUrl, initialTime, isPlaying]);

    const handleRestore = () => {
        if (mediaRef.current) {
            onRestore(mediaRef.current.currentTime, !mediaRef.current.paused);
        }
    };

    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mediaRef.current) {
            if (mediaRef.current.paused) {
                mediaRef.current.play().catch(console.error);
            } else {
                mediaRef.current.pause();
            }
        }
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <div className="mini-player w-80 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg shadow-2xl flex items-center p-2 gap-3 border border-gray-300 dark:border-gray-700">
            <div 
                onClick={handleRestore}
                className="w-24 h-14 bg-black rounded-md flex-shrink-0 cursor-pointer overflow-hidden flex items-center justify-center"
            >
                {!mediaUrl ? (
                    <SpinnerIcon className="w-6 h-6 text-white/50 animate-spin" />
                ) : media.mediaType === 'video' ? (
                    <video ref={mediaRef} src={mediaUrl} muted playsInline className="w-full h-full object-cover" />
                ) : (
                    <MusicIcon className="w-8 h-8 text-white/70" />
                )}
                {media.mediaType === 'audio' && <audio ref={mediaRef} src={mediaUrl || ''} />}
            </div>
            <div onClick={handleRestore} className="flex-grow cursor-pointer overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={media.name}>
                    {media.name}
                </p>
            </div>
            <div className="flex items-center gap-1 text-gray-800 dark:text-gray-200">
                <button onClick={handlePlayPause} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                    {isCurrentlyPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default MiniPlayer;