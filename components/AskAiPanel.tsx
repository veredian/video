import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { MediaData } from '../services/authService';
import { mediaDBService } from '../services/mediaDBService';
import { BanIcon } from './icons/BanIcon';
import { useTranslation } from '../i18n/LanguageContext';

interface AskAiPanelProps {
  media: MediaData;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      const result = reader.result as string;
      // Return only the base64 part, without the data URI scheme
      resolve(result.split(',')[1]); 
    };
    reader.onerror = error => reject(error);
  });
};

const AskAiPanel: React.FC<AskAiPanelProps> = ({ media }) => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  const handleAsk = async () => {
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }

      const mediaBlob = await mediaDBService.getMedia(media.id);
      if (!mediaBlob) {
        throw new Error("Could not retrieve media data from the database.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const base64Data = await blobToBase64(mediaBlob);
      const mediaPart = {
        inlineData: {
            mimeType: media.type,
            data: base64Data,
        },
      };

      let prompt = '';
      if (media.mediaType === 'video') {
        prompt = `Identify the main theme or a potential narrative arc of the video titled "${media.name}". Then, list 3-5 key visual elements or scenes that support this theme.`;
      } else if (media.mediaType === 'image') {
        prompt = `Analyze the provided image titled "${media.name}". Describe the key objects, colors, composition, and overall mood of the image.`;
      } else if (media.mediaType === 'audio') {
        prompt = `Analyze the provided audio file titled "${media.name}". Describe its content: is it speech, music, or something else? If it's speech, provide a brief transcript. If it's music, describe the genre, instruments, and mood.`;
      }

      if (question.trim()) {
        prompt += `\n\nFinally, based on the content, answer the user's specific question: "${question}"`;
      }

      const textPart = { text: prompt };
      
      const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [textPart, mediaPart] },
      });

      setResponse(result.text);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(t('aiPanel.error', { error: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="relative flex-grow flex flex-col">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('aiPanel.placeholder')}
          className="w-full h-24 p-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
          disabled={isLoading}
        />
        <button
          onClick={handleAsk}
          disabled={isLoading}
          className="mt-2 w-full flex justify-center items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              {t('aiPanel.analyzing')}
            </>
          ) : (
             <>
                {question.trim() ? t('aiPanel.ask') : t('aiPanel.analyze')}
                <PaperAirplaneIcon className="w-5 h-5" />
             </>
          )}
        </button>
        <div className="mt-4 flex-grow overflow-y-auto max-h-64 pr-2">
            {response && (
                 <div className="text-sm p-3 bg-white dark:bg-gray-800/50 rounded-lg whitespace-pre-wrap">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{t('aiPanel.answer')}</p>
                    <p className="text-gray-600 dark:text-gray-300">{response}</p>
                </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AskAiPanel;
