import React from 'react';
import { XIcon } from './icons/XIcon';
import { Logo } from './icons/Logo';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  
  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 border-b-2 border-cyan-500 pb-1">
        {title}
      </h3>
      <div className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
        {children}
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      <div 
        className="relative w-full max-w-2xl m-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <Logo className="w-12 h-auto" />
                <h2 id="help-title" className="text-2xl font-bold text-gray-900 dark:text-white">About NV & NE ltd</h2>
            </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full transition-colors"
            aria-label="Close help"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[70vh] pr-4 -mr-4">
            <Section title="High-Level Summary">
                <p>
                    This application is a sophisticated, modern web application that functions as a secure, personal video management system running entirely in your browser. It's a <span className="font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">mackson development Software</span> where users can sign up, log in, manage a private library of their videos, and use a powerful AI to analyze and answer questions about video content.
                </p>
            </Section>

            <Section title="Key Features">
                <ul className="list-disc list-inside space-y-3">
                    <li>
                        <strong>Secure User Authentication:</strong> Includes a full sign-up, login, and email verification flow with "Remember me" and logout functionality.
                    </li>
                    <li>
                        <strong>Robust Video Management:</strong> Uses your browser's <strong>IndexedDB</strong> for fast, private, and offline-functional video storage. A user-friendly drag & drop uploader makes adding videos simple.
                    </li>
                    <li>
                        <strong>Advanced Video Player:</strong> Features a custom player and a standout <strong>Cinema Mode</strong> that creates an immersive, blurred background glow from the video's colors.
                    </li>
                    <li>
                        <strong>AI-Powered Video Analysis:</strong> The app's most powerful feature. You can ask the AI for a summary of the video or ask specific questions about its content. The app securely sends video data to an advanced AI model for analysis.
                    </li>
                    <li>
                        <strong>Easy Sharing Options:</strong> Instantly generate a shareable link or an HTML <code>&lt;iframe&gt;</code> embed code for any video. Note that these are temporary and session-based.
                    </li>
                     <li>
                        <strong>Customizable User Settings:</strong> Personalize your experience by toggling Dark Mode, video looping, and Cinema Mode.
                    </li>
                </ul>
            </Section>
            
            <Section title="Technical Stack">
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Frontend Framework:</strong> React with TypeScript</li>
                    <li><strong>Styling:</strong> Tailwind CSS</li>
                    <li><strong>AI Integration:</strong> AI-Powered Analysis</li>
                    <li><strong>Local Storage:</strong> IndexedDB (for video files) and LocalStorage (for user data/settings)</li>
                </ul>
            </Section>

            <Section title="Created By">
                <p>
                    This application was personally created by Byiringiro Mackson.
                </p>
            </Section>

            <Section title="Support & Control">
                <p>
                    This application and all its features are controlled and managed by Byiringiro Mackson.
                </p>
                <p className="mt-2">
                    For any support inquiries, issues, or questions, please contact us at our controlling email address: <a href="mailto:byiringiromackson2@gmail.com" className="text-cyan-500 hover:underline font-semibold">byiringiromackson2@gmail.com</a>.
                </p>
            </Section>

            <Section title="Troubleshooting">
                <p>
                    If you encounter any issues, please try the following steps first:
                </p>
                <ul className="list-decimal list-inside space-y-2 pl-4">
                    <li><strong>Video Upload Failed:</strong> Ensure you are using a standard video format (like MP4 or WebM) and that your browser has sufficient storage space.</li>
                    <li><strong>AI Analysis Error:</strong> Check your internet connection. An API key for the AI service must be correctly configured in the application's environment for this feature to work.</li>
                    <li><strong>General Problems:</strong> Try refreshing the page or clearing your browser's cache for this site.</li>
                </ul>
            </Section>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;