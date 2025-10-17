import React, { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';
import { Logo } from './icons/Logo';
import { SpinnerIcon } from './icons/SpinnerIcon';
import VerificationModal from './VerificationModal';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n/LanguageContext';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (mode === 'login') {
      const rememberedEmail = authService.getRememberedUser();
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, [mode]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (mode === 'login') {
      const result = await authService.login(email, password, rememberMe);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(t(result.message));
      }
    } else { // signup
      setShowVerification(true);
    }
    setIsLoading(false);
  };
  
  const handleVerificationSuccess = async () => {
    setShowVerification(false);
    setIsLoading(true);
    const result = await authService.signup(email, password);
    if(result.success) {
        setSuccessMessage(t(result.message));
        setMode('login'); // Switch to login tab after successful signup
        setPassword('');
    } else {
        setError(t(result.message));
    }
    setIsLoading(false);
  }

  const handleResendCode = async () => {
    await authService.resendVerificationCode(email);
    // The modal itself will display a success message.
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setRememberMe(false);
    setShowPassword(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="absolute top-4 right-4 z-10">
            <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md">
            <header className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <Logo className="w-16 h-auto" />
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                        NV & NE ltd
                    </h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    {t('auth.greeting')}
                </p>
            </header>
            
            <main className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 border border-gray-300 dark:border-gray-700 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <div className="flex border-b border-gray-300 dark:border-gray-600 mb-6">
                    <button onClick={() => switchMode('login')} className={`flex-1 py-2 text-center font-semibold transition-colors duration-200 ${mode === 'login' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-400'}`}>
                        {t('auth.login')}
                    </button>
                    <button onClick={() => switchMode('signup')} className={`flex-1 py-2 text-center font-semibold transition-colors duration-200 ${mode === 'signup' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-400'}`}>
                        {t('auth.signup')}
                    </button>
                </div>

                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.emailLabel')}</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder={t('auth.emailPlaceholder')}
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.passwordLabel')}</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder={t('auth.passwordPlaceholder')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {mode === 'login' && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                {t('auth.rememberMe')}
                                </label>
                            </div>
                        </div>
                    )}


                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    {successMessage && <p className="text-sm text-green-500 text-center">{successMessage}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading && <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />}
                        {mode === 'login' ? t('auth.logIn') : t('auth.createAccount')}
                    </button>
                </form>
            </main>
        </div>
        <VerificationModal 
            isOpen={showVerification}
            onClose={() => setShowVerification(false)}
            onVerify={handleVerificationSuccess}
            onResend={handleResendCode}
            email={email}
        />
    </div>
  );
};

export default AuthPage;