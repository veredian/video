import React, { useState, useCallback } from 'react';
import { LinkIcon } from './icons/LinkIcon';
import { CodeIcon } from './icons/CodeIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { MediaType } from '../services/authService';
import { useTranslation } from '../i18n/LanguageContext';

interface ShareOptionsProps {
  mediaUrl: string;
  fileName: string;
  mediaType: MediaType;
}

type Tab = 'link' | 'embed';

const ShareOptions: React.FC<ShareOptionsProps> = ({ mediaUrl, fileName, mediaType }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const getEmbedCode = () => {
    switch (mediaType) {
      case 'audio':
        return `<audio controls src="${mediaUrl}" title="${fileName}"></audio>`;
      case 'image':
        return `<img src="${mediaUrl}" alt="${fileName}" style="max-width: 100%; height: auto;" />`;
      case 'video':
      default:
        return `<iframe src="${mediaUrl}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${fileName}"></iframe>`;
    }
  };
  const embedCode = getEmbedCode();

  const handleCopy = useCallback((text: string, type: Tab) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      }
    });
  }, []);

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeTab === tabName ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const CodeBox: React.FC<{ content: string; copied: boolean; onCopy: () => void }> = ({ content, copied, onCopy }) => (
    <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mt-4 border border-gray-300 dark:border-gray-700">
      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all pr-12">
        <code>{content}</code>
      </pre>
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-800 rounded-md transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
      </button>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-300 dark:border-gray-700 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('share.title')}</h3>
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
        <TabButton tabName="link" label={t('share.shareLink')} icon={<LinkIcon className="w-5 h-5" />} />
        <TabButton tabName="embed" label={t('share.embedCode')} icon={<CodeIcon className="w-5 h-5" />} />
      </div>
      <div className="mt-4 flex-grow flex flex-col">
        {activeTab === 'link' ? (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('share.linkDescription')}</p>
            <CodeBox content={mediaUrl} copied={copiedLink} onCopy={() => handleCopy(mediaUrl, 'link')} />
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('share.embedDescription')}</p>
            <CodeBox content={embedCode} copied={copiedEmbed} onCopy={() => handleCopy(embedCode, 'embed')} />
          </div>
        )}
        <div className="mt-auto pt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            {t('share.note')}
        </div>
      </div>
    </div>
  );
};

export default ShareOptions;
