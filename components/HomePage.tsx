import React from 'react';
import { Logo } from './icons/Logo';
import { useTranslation } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface HomePageProps {
  onEnter: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onEnter }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-2xl">
        <header className="mb-8">
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
                <Logo className="w-32 h-auto" />
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                    {t('home.title')}
                </h1>
            </div>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                {t('home.subtitle')}
            </p>
        </header>

        <main className="flex flex-col items-center">
            <p className="text-md text-gray-500 dark:text-gray-400 mb-8">
              {t('home.description')}
            </p>
            <button
                onClick={onEnter}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-xl shadow-cyan-500/30"
            >
                {t('home.getStarted')}
            </button>
        </main>

        <footer className="text-center mt-16 text-gray-500 dark:text-gray-400 text-sm">
          <p>{t('home.madeBy', { creator: 'Eric tech' })}</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
