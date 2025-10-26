import React from 'react';
import { XIcon } from './icons/XIcon';
import { Logo } from './icons/Logo';
import { useTranslation } from '../i18n/LanguageContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

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
                <h2 id="help-title" className="text-2xl font-bold text-gray-900 dark:text-white">{t('help.title')}</h2>
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
            <Section title={t('help.summaryTitle')}>
                <p>
                    {t('help.summaryText', { creator: 'Eric tech' })}
                </p>
            </Section>

            <Section title={t('help.featuresTitle')}>
                <ul className="list-disc list-inside space-y-3">
                    <li>{t('help.featureAuth')}</li>
                    <li>{t('help.featureMediaManagement')}</li>
                    <li>{t('help.featurePlayer')}</li>
                    <li>{t('help.featureAI')}</li>
                    <li>{t('help.featureShare')}</li>
                    <li>{t('help.featureWatermark')}</li>
                    <li>{t('help.featureSettings')}</li>
                </ul>
            </Section>
            
            <Section title={t('help.stackTitle')}>
                <ul className="list-disc list-inside space-y-2">
                    <li>{t('help.stackFrontend')}</li>
                    <li>{t('help.stackStyling')}</li>
                    <li>{t('help.stackAI')}</li>
                    <li>{t('help.stackStorage')}</li>
                </ul>
            </Section>

            <Section title={t('help.createdByTitle')}>
                <p>
                    {t('help.createdByText', { creator: 'Eric tech' })}
                </p>
            </Section>

            <Section title={t('help.supportTitle')}>
                <p>
                    {t('help.supportText1', { creator: 'Eric tech' })}
                </p>
                <p className="mt-2">
                    {t('help.supportText2', { email: '' })}
                     <a href="mailto:Macksonbyiringiro2@gmail.com" className="text-cyan-500 hover:underline font-semibold">Macksonbyiringiro2@gmail.com</a>.
                </p>
            </Section>

            <Section title={t('help.troubleshootingTitle')}>
                <p>
                    {t('help.troubleshootingIntro')}
                </p>
                <ul className="list-decimal list-inside space-y-2 pl-4">
                    <li>{t('help.troubleUpload')}</li>
                    <li>{t('help.troubleAI')}</li>
                    <li>{t('help.troubleGeneral')}</li>
                </ul>
            </Section>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;