import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface AskAiPanelProps {
  videoName: string;
}

const AskAiPanel: React.FC<AskAiPanelProps> = ({ videoName }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Based on a video titled "${videoName}", answer the following question: "${question}"`;
      
      const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
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
          placeholder="e.g., What is the main topic of this video?"
          className="w-full h-24 p-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
          disabled={isLoading}
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !question.trim()}
          className="mt-2 w-full flex justify-center items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              Asking...
            </>
          ) : (
             <>
                Ask Gemini
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
