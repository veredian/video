import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { VolumeMuteIcon } from './icons/VolumeMuteIcon';
import { FullscreenIcon } from './icons/FullscreenIcon';
import { FullscreenExitIcon } from './icons/FullscreenExitIcon';
import { PictureInPictureIcon } from './icons/PictureInPictureIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { BanIcon } from './icons/BanIcon';
import { MediaType } from '../services/authService';
import { useTranslation } from '../i18n/LanguageContext';

interface MediaPlayerProps {
  src: string;
  mediaType: MediaType;
  fileName: string;
  mimeType: string;
  loop: boolean;
  cinemaMode: boolean;
  showWatermark: boolean;
  watermarkText: string;
  defaultPlaybackSpeed: number;
}

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds === Infinity) {
    return '0:00';
  }
  const flooredTime = Math.floor(timeInSeconds);
  const minutes = Math.floor(flooredTime / 60);
  const seconds = flooredTime % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const MediaPlayer: React.FC<MediaPlayerProps> = ({ 
    src, mediaType, fileName, loop, cinemaMode, showWatermark, watermarkText, defaultPlaybackSpeed, mimeType
}) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(defaultPlaybackSpeed);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [scrubPosition, setScrubPosition] = useState(0);

  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement & HTMLImageElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const seekInputRef = useRef<HTMLInputElement>(null);
  
  const handleMediaError = useCallback(() => {
    setIsWaiting(false);
    setLoadError(true);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (mediaRef.current) {
      if (mediaRef.current.paused) {
        mediaRef.current.play().catch(handleMediaError);
      } else {
        mediaRef.current.pause();
      }
    }
  }, [handleMediaError]);

  const hideControls = () => {
    if (isPlaying) {
      setIsControlsVisible(false);
    }
  };

  const showControls = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setIsControlsVisible(true);
    controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  };

  useEffect(() => {
    if (isPlaying) showControls();
    else {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setIsControlsVisible(true);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const mediaElement = mediaRef.current;
    if (!mediaElement || mediaType === 'image') return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(mediaElement.currentTime);
      if (seekInputRef.current) {
        const progress = (mediaElement.currentTime / duration) * 100;
        seekInputRef.current.style.setProperty('--progress', `${progress || 0}%`);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(mediaElement.duration);
      setIsWaiting(false);
    };
    const onCanPlay = () => setIsWaiting(false);
    const onVolumeChange = () => {
      setIsMuted(mediaElement.muted);
      setVolume(mediaElement.volume);
    };
    const onWaiting = () => setIsWaiting(true);
    const onPlaying = () => setIsWaiting(false);
    const onProgress = () => {
        if (mediaElement.buffered.length > 0) {
            setBuffered(mediaElement.buffered.end(mediaElement.buffered.length - 1));
        }
    };
    const onEnterPiP = () => setIsPipActive(true);
    const onLeavePiP = () => setIsPipActive(false);

    mediaElement.addEventListener('play', onPlay);
    mediaElement.addEventListener('pause', onPause);
    mediaElement.addEventListener('ended', onEnded);
    mediaElement.addEventListener('timeupdate', onTimeUpdate);
    mediaElement.addEventListener('loadedmetadata', onLoadedMetadata);
    mediaElement.addEventListener('canplay', onCanPlay);
    mediaElement.addEventListener('volumechange', onVolumeChange);
    mediaElement.addEventListener('waiting', onWaiting);
    mediaElement.addEventListener('playing', onPlaying);
    mediaElement.addEventListener('progress', onProgress);
    if (mediaType === 'video') {
        mediaElement.addEventListener('enterpictureinpicture', onEnterPiP);
        mediaElement.addEventListener('leavepictureinpicture', onLeavePiP);
    }
    
    mediaElement.playbackRate = playbackRate;
    mediaElement.currentTime = 0;
    setIsWaiting(true);
    setLoadError(false);

    return () => {
      mediaElement.removeEventListener('play', onPlay);
      mediaElement.removeEventListener('pause', onPause);
      mediaElement.removeEventListener('ended', onEnded);
      mediaElement.removeEventListener('timeupdate', onTimeUpdate);
      mediaElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      mediaElement.removeEventListener('canplay', onCanPlay);
      mediaElement.removeEventListener('volumechange', onVolumeChange);
      mediaElement.removeEventListener('waiting', onWaiting);
      mediaElement.removeEventListener('playing', onPlaying);
      mediaElement.removeEventListener('progress', onProgress);
      if (mediaType === 'video') {
        mediaElement.removeEventListener('enterpictureinpicture', onEnterPiP);
        mediaElement.removeEventListener('leavepictureinpicture', onLeavePiP);
      }
    };
  }, [src, duration, playbackRate, mediaType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        const media = mediaRef.current;
        if (!media) return;

        switch (e.code) {
            case 'Space': if (mediaType !== 'image') { e.preventDefault(); handlePlayPause(); } break;
            case 'KeyM': if (mediaType !== 'image') toggleMute(); break;
            case 'KeyF': if (mediaType === 'video') toggleFullscreen(); break;
            case 'ArrowLeft': if (mediaType !== 'image') { e.preventDefault(); media.currentTime -= 5; } break;
            case 'ArrowRight': if (mediaType !== 'image') { e.preventDefault(); media.currentTime += 5; } break;
            case 'ArrowUp': if (mediaType !== 'image') { e.preventDefault(); setVolume(v => Math.min(v + 0.1, 1)); } break;
            case 'ArrowDown': if (mediaType !== 'image') { e.preventDefault(); setVolume(v => Math.max(v - 0.1, 0)); } break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, mediaType]);

  useEffect(() => {
    const media = mediaRef.current;
    if (media && mediaType !== 'image') {
        media.volume = volume;
        media.muted = isMuted;
    }
  }, [volume, isMuted, mediaType]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mediaRef.current) mediaRef.current.currentTime = Number(e.target.value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if(newVolume > 0) setIsMuted(false);
  };
  
  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if(isMuted && volume === 0) setVolume(0.5);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    }
    else document.exitFullscreen();
  };

  const togglePiP = () => {
    const videoElement = mediaRef.current as HTMLVideoElement;
    if (!videoElement) return;
    if(document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(err => {
            console.error(`Error attempting to exit picture-in-picture mode: ${err.message} (${err.name})`);
        });
    }
    else {
        videoElement.requestPictureInPicture().catch(err => {
            console.error(`Error attempting to enter picture-in-picture mode: ${err.message} (${err.name})`);
        });
    }
  };

  useEffect(() => {
    const video = mediaRef.current as HTMLVideoElement;
    const canvas = canvasRef.current;
    if (mediaType !== 'video' || !video || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    let animationFrameId: number;
    const renderLoop = () => {
      if (video.paused || video.ended || !cinemaMode) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    if (isPlaying && cinemaMode) {
      canvas.width = video.videoWidth / 8;
      canvas.height = video.videoHeight / 8;
      animationFrameId = requestAnimationFrame(renderLoop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, cinemaMode, src, mediaType]);

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if(mediaRef.current) mediaRef.current.playbackRate = rate;
    setShowSpeedMenu(false);
  }
  
  const handleSeekBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekInputRef.current || !duration) return;
    const rect = seekInputRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const clampedX = Math.max(0, Math.min(x, width));
    const percentage = clampedX / width;
    setScrubTime(percentage * duration);
    setScrubPosition(clampedX);
    setIsScrubbing(true);
  };

  const renderPlayer = () => {
    switch (mediaType) {
      case 'video':
        return (
          <video ref={mediaRef} loop={loop} muted={isMuted} playsInline preload="metadata" className="relative z-10 w-full h-full object-contain" crossOrigin="anonymous" onClick={(e) => e.stopPropagation()} onError={handleMediaError}>
            <source src={`${src}#t=0.1`} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/10 dark:bg-black/20" onClick={(e) => e.stopPropagation()}>
                 <p className="text-xl font-semibold text-gray-800 dark:text-white truncate max-w-full px-4">{fileName}</p>
                 <audio ref={mediaRef} loop={loop} muted={isMuted} playsInline preload="metadata" className="hidden" onError={handleMediaError}>
                    <source src={src} type={mimeType} />
                 </audio>
            </div>
        );
      case 'image':
        return (
            <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                <img ref={mediaRef} src={src} alt={fileName} className="max-w-full max-h-full object-contain rounded-md shadow-lg" onError={handleMediaError} onLoad={() => setIsWaiting(false)} />
            </div>
        );
      default:
        return <p>Unsupported media type.</p>;
    }
  };
  
  const bufferedPercentage = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div ref={playerContainerRef} className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg group ${mediaType !== 'image' ? '' : 'bg-gray-100 dark:bg-gray-900'}`} onMouseMove={showControls} onMouseLeave={hideControls} onClick={mediaType !== 'image' ? handlePlayPause : undefined}>
       {mediaType === 'video' && <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${cinemaMode && isPlaying ? 'opacity-60' : 'opacity-0'}`} style={{ filter: 'blur(30px)', transform: 'scale(1.2)' }} />}
       
       <div className="relative w-full h-full">
         {renderPlayer()}
        
        {loadError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white p-4 text-center">
            <BanIcon className="w-12 h-12 text-red-400 mb-2" />
            <p className="font-semibold">{t('player.errorTitle')}</p>
            <p className="text-sm text-gray-300">{t('player.errorDescription')}</p>
          </div>
        )}
        
        {isWaiting && !loadError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
                <SpinnerIcon className="w-12 h-12 text-white/80 animate-spin" />
            </div>
        )}

        {mediaType !== 'image' && !loadError && (
            <div className={`absolute bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
               <div className="relative flex items-center gap-2" onMouseMove={handleSeekBarHover} onMouseLeave={() => setIsScrubbing(false)}>
                {isScrubbing && (
                    <div 
                        className="absolute bottom-full mb-2 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded-md pointer-events-none transform -translate-x-1/2"
                        style={{ left: `${scrubPosition}px` }}
                    >
                        {formatTime(scrubTime)}
                    </div>
                )}
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[0.35rem] bg-white/60 rounded-full pointer-events-none"
                    style={{ width: `${bufferedPercentage}%` }}
                />
                <input ref={seekInputRef} type="range" min="0" max={duration} value={currentTime} onChange={handleSeek} className="video-range w-full" style={{'--progress': `${(currentTime / duration) * 100}%`} as React.CSSProperties} />
               </div>
               <div className="flex items-center justify-between mt-1 text-white font-medium text-sm">
                 <div className="flex items-center gap-3">
                   <button onClick={handlePlayPause} className="p-1 hover:scale-110 transition-transform">
                    {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
                   </button>
                    <div className="flex items-center gap-2 group/volume">
                      <button onClick={toggleMute} className="p-1">
                        {isMuted || volume === 0 ? <VolumeMuteIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
                      </button>
                      <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} className="video-range w-0 group-hover/volume:w-20 transition-all duration-300" style={{'--progress': `${isMuted ? 0 : volume * 100}%`} as React.CSSProperties} />
                    </div>
                   <span className="tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="relative">
                        <button onClick={() => setShowSpeedMenu(s => !s)} className="p-1 font-semibold text-xs w-10 h-7 rounded bg-black/30 hover:bg-black/50">
                            {playbackRate}x
                        </button>
                        {showSpeedMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-md py-1">
                                {PLAYBACK_RATES.map(rate => (
                                    <button key={rate} onClick={() => handlePlaybackRateChange(rate)} className={`px-4 py-1 text-xs w-full text-left ${playbackRate === rate ? 'bg-cyan-500' : 'hover:bg-white/20'}`}>
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {mediaType === 'video' && document.pictureInPictureEnabled && (
                        <button onClick={togglePiP} className="p-1 hover:scale-110 transition-transform">
                           <PictureInPictureIcon className="w-6 h-6" />
                        </button>
                    )}
                    {mediaType === 'video' && (
                        <button onClick={toggleFullscreen} className="p-1 hover:scale-110 transition-transform">
                            {isFullscreen ? <FullscreenExitIcon className="w-6 h-6" /> : <FullscreenIcon className="w-6 h-6" />}
                        </button>
                    )}
                 </div>
               </div>
            </div>
        )}
        
        {mediaType === 'video' && showWatermark && (
          <div className="watermark" aria-hidden="true">
            <div className="watermark-text">{watermarkText}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPlayer;