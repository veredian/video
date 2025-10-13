import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon } from './icons/PlayIcon';

interface VideoPlayerProps {
  src: string;
  loop: boolean;
  cinemaMode: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, loop, cinemaMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePlay = () => {
    videoRef.current?.play();
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('ended', onEnded);
    
    setIsPlaying(false);
    videoElement.currentTime = 0;

    return () => {
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
      videoElement.removeEventListener('ended', onEnded);
    };
  }, [src]);
  
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    let animationFrameId: number;

    const renderLoop = () => {
      if (video.paused || video.ended || !cinemaMode) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
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

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, cinemaMode, src]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-gray-300 dark:border-gray-700">
       <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${cinemaMode && isPlaying ? 'opacity-60' : 'opacity-0'}`}
        style={{ filter: 'blur(30px)', transform: 'scale(1.2)' }}
      />
      <div className="relative w-full h-full group">
        <video
          ref={videoRef}
          controls={isPlaying}
          loop={loop}
          muted
          playsInline
          preload="metadata"
          className="relative z-10 w-full h-full object-contain"
          crossOrigin="anonymous"
        >
          <source src={`${src}#t=0.1`} />
          Your browser does not support the video tag.
        </video>
        {!isPlaying && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 z-20 flex items-center justify-center w-full h-full bg-black bg-opacity-30 cursor-pointer transition-opacity duration-300 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 rounded-lg"
            aria-label="Play video"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-3 sm:p-4 transition-transform duration-300 group-hover:scale-110">
              <PlayIcon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;