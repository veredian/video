import React from 'react';
import { UserIcon } from '../icons/UserIcon';

const Step3: React.FC = () => {
    return (
        <div>
            <UserIcon className="w-20 h-20 mx-auto text-cyan-400 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">
                Account Setup
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-sm mx-auto">
                An account is required to save and manage your personal media library.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="w-full sm:w-auto px-8 py-3 bg-gray-800 border border-gray-600 text-white font-semibold rounded-lg text-lg">
                    Log In
                </div>
                <div className="w-full sm:w-auto px-8 py-3 bg-gray-800 border border-gray-600 text-white font-semibold rounded-lg text-lg">
                    Sign Up
                </div>
            </div>
        </div>
    );
};
export default Step3;