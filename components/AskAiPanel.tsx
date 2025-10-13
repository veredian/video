import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { VideoData } from '../services/authService';
import { videoDBService } from '../services/videoDBService';

interface AskAiPanelProps {
  video: VideoData;
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

const AskAiPanel: React.FC<AskAiPanelProps> = ({ video }) => {
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

      const videoBlob = await videoDBService.getVideo(video.id);
      if (!videoBlob) {
        throw new Error("Could not retrieve video data from the database.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const base64Data = await blobToBase64(videoBlob);
      const videoPart = {
        inlineData: {
            mimeType: video.type,
            data: base64Data,
        },
      };

      let prompt = `Analyze the content of the provided video titled "${video.name}". 

Please provide the following:
1. A brief summary of the video.
2. A list of key talking points or main events in bullet points.`;

      if (question.trim()) {
        prompt += `\n\nFinally, based on the video's content, answer the user's specific question: "${question}"`;
      } else {
        prompt += `\n\nIf there are no clear talking points (e.g., it's a music video or abstract), describe the visual themes and overall mood.`
      }

      const textPart = { text: prompt };
      
      const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [textPart, videoPart] },
      });

      setResponse(result.text);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Sorry, I couldn't get an answer. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-300 dark:border-gray-700 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-cyan-400" />
        Ask About Video
      </h3>
      <div className="relative flex-grow flex flex-col">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a specific question (optional)..."
          className="w-full h-24 p-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
          disabled={isLoading}
        />
        <button
          onClick={handleAsk}
          disabled={isLoading}
          className="mt-2 w-full flex justify-center items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
             <>
                {question.trim() ? 'Ask Gemini' : 'Analyze Video'}
                <PaperAirplaneIcon className="w-5 h-5" />
             </>
          )}
        </button>
        <div className="mt-4 flex-grow overflow-y-auto max-h-48 pr-2">
            {response && (
                 <div className="text-sm p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg whitespace-pre-wrap">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Answer:</p>
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