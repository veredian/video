import React from 'react';
import { Logo } from '../icons/Logo';
import { useTranslation } from '../../i18n/LanguageContext';

const Step1: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div>
            <Logo className="w-40 h-auto mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to NV . NE
            </h1>
            <p className="text-lg text-gray-400 max-w-sm mx-auto">
                {t('home.subtitle')}
            </p>
        </div>
    );
};
export default Step1;