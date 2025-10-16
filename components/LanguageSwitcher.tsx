import React from 'react';
import { useTranslation, Language } from '../i18n/LanguageContext';
import { GlobeIcon } from './icons/GlobeIcon';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useTranslation();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="relative flex items-center bg-gray-200/50 dark:bg-black/20 rounded-lg">
            <GlobeIcon className="w-5 h-5 absolute left-3 text-gray-500 dark:text-gray-400 pointer-events-none" />
            <select
                value={language}
                onChange={handleLanguageChange}
                className="appearance-none w-full bg-transparent text-gray-800 dark:text-gray-300 font-semibold py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                aria-label="Change language"
            >
                <option value="en" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">English</option>
                <option value="rw" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">Kinyarwanda</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher;
