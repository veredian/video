import React from 'react';
import { UploadIcon } from '../icons/UploadIcon';
import { FilmIcon } from '../icons/FilmIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start text-left gap-4 p-4 rounded-lg bg-gray-900/50 border border-gray-700 w-full">
        <div className="flex-shrink-0 text-cyan-400 mt-1">{icon}</div>
        <div>
            <h3 className="font-semibold text-white text-lg">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </div>
);

const Step2: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">
                What You Can Do
            </h1>
            <div className="space-y-4">
                <FeatureCard 
                    icon={<UploadIcon className="w-7 h-7" />} 
                    title="Upload Files"
                    description="Easily upload and securely store your videos, audio, and images."
                />
                 <FeatureCard 
                    icon={<FilmIcon className="w-7 h-7" />} 
                    title="Manage Your Library"
                    description="Organize, search, and manage all your media in one place."
                />
                 <FeatureCard 
                    icon={<SparklesIcon className="w-7 h-7" />} 
                    title="AI Media Analysis"
                    description="Get summaries or answers to questions about your media content."
                />
            </div>
        </div>
    );
};
export default Step2;