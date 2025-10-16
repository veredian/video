import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useTranslation } from '../i18n/LanguageContext';

interface MediaUploaderProps {
  onMediaUpload: (mediaFile: File) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onMediaUpload }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleFile = useCallback(async (file: File | null | undefined) => {
    if (isProcessing) return;

    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/') || file.type.startsWith('image/'))) {
      setIsProcessing(true);
      setFileName(file.name);
      setProgress(0);
      
      // Simulate processing time
      progressIntervalRef.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setTimeout(() => {
              onMediaUpload(file);
            }, 300);
            return 100;
          }
          return prev + 10;
        });
      }, 50);

    } else if (file) {
      alert(t('uploader.errorInvalidFile'));
    }
  }, [onMediaUpload, isProcessing, t]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, [isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    e.preventDefault();
    e.stopPropagation();
  }, [isProcessing]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, [isProcessing, handleFile]);

  const handleClick = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-10 sm:p-16 text-center">
        <SpinnerIcon className="w-16 h-16 mx-auto mb-4 text-cyan-500 animate-spin" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('uploader.processing')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-full max-w-xs mb-4" title={fileName}>{fileName}</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-cyan-500 h-2.5 rounded-full transition-all duration-150 ease-linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-2">{Math.round(progress)}%</p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-10 sm:p-16 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer group ${
        isDragging 
          ? 'border-cyan-400 bg-cyan-500/10' 
          : 'border-gray-400 dark:border-gray-600 hover:border-cyan-500 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      aria-label="Upload media"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*,audio/*,image/*"
        className="hidden"
        aria-hidden="true"
      />
      <div className="text-center">
        <UploadIcon className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDragging ? 'text-cyan-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-cyan-400'}`} />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('uploader.title')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">{t('uploader.subtitle')}</p>
        <p className="text-xs text-gray-600 dark:text-gray-500 mt-4">{t('uploader.supports')}</p>
      </div>
    </div>
  );
};

export default MediaUploader;
