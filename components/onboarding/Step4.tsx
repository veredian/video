import React from 'react';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

const Step4: React.FC = () => {
    return (
        <div>
            <CheckCircleIcon className="w-24 h-24 mx-auto text-green-400 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">
                You are ready!
            </h1>
            <p className="text-lg text-gray-400 max-w-sm mx-auto">
                You've completed the tour. Click the button below to proceed and start managing your media.
            </p>
        </div>
    );
};
export default Step4;