import React, { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';
import { Logo } from './icons/Logo';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { EmailIcon } from './icons/EmailIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n/LanguageContext';
import VerificationModal from './VerificationModal';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup';
type AuthMethod = 'email' | 'phone';

const isEmail = (identifier: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(identifier);
};

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  useEffect(() => {
    const remembered = authService.getRememberedUser();
    if (remembered) {
        if (isEmail(remembered)) {
            setAuthMethod('email');
        } else {
            setAuthMethod('phone');
        }
        setIdentifier(remembered);
        setRememberMe(true);
    }
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    if (authMethod === 'phone' && !/^\+?[0-9\s-]{7,}$/.test(identifier)) {
        setError(t('auth.errorInvalidPhone'));
        setIsLoading(false);
        return;
    }

    if (mode === 'login') {
      const result = await authService.login(identifier, password, rememberMe);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(t(result.message));
        setIsLoading(false);
      }
    } else { // signup
      const signupResult = await authService.signup(identifier, password);
      if (signupResult.success) {
        setSuccessMessage(t(signupResult.message));
        const adminEmail = "Macksonbyiringiro2@gmail.com";
        console.log(`Simulating notification to ${adminEmail}: New user signed up with ${authMethod}: ${identifier}`);
        setTimeout(() => {
            setSuccessMessage('');
            setIsVerificationOpen(true);
        }, 1500);
      } else {
        setError(t(signupResult.message));
      }
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
    setIsVerificationOpen(false);
    setIsLoading(true);
    // Now log the user in after successful verification
    const result = await authService.login(identifier, password, rememberMe);
    if (result.success && result.user) {
        onLogin(result.user);
    } else {
        setError(t(result.message) || 'Login failed after verification.');
        setMode('login'); // Switch to login mode if auto-login fails
    }
    setIsLoading(false);
  };

  const handleResendCode = () => {
      console.log(`Simulating resending verification code to ${identifier}`);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setPassword('');
    setRememberMe(false);
    setShowPassword(false);
  };

  const switchAuthMethod = (method: AuthMethod) => {
    setAuthMethod(method);
    setIdentifier('');
    setError('');
  };

  return (
    <div className="min-h-screen dark:text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="absolute top-4 right-4 z-10">
            <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md">
            <header className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <Logo className="w-28 h-auto" />
                    <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                        {t('home.title')}
                    </h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    {t('home.subtitle')}
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

                <form onSubmit={handleAuthAction} className="space-y-5">
                    <div className="flex gap-2 p-1 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg">
                        <button type="button" onClick={() => switchAuthMethod('email')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${authMethod === 'email' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>
                           <EmailIcon className="w-5 h-5" /> {t('auth.email')}
                        </button>
                        <button type="button" onClick={() => switchAuthMethod('phone')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${authMethod === 'phone' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>
                           <PhoneIcon className="w-5 h-5" /> {t('auth.phone')}
                        </button>
                    </div>

                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {authMethod === 'email' 
                                    ? <EmailIcon className="h-5 w-5 text-gray-400" /> 
                                    : <PhoneIcon className="h-5 w-5 text-gray-400" />
                                }
                            </div>
                            <input
                                id="identifier"
                                name="identifier"
                                type={authMethod === 'email' ? 'email' : 'tel'}
                                autoComplete={authMethod === 'email' ? 'email' : 'tel'}
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder={authMethod === 'email' ? t('auth.emailPlaceholder') : t('auth.phonePlaceholder')}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
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

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    {successMessage && <p className="text-sm text-green-500 text-center">{successMessage}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2.5 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading && <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />}
                        {mode === 'login' ? t('auth.logIn') : t('auth.createAccount')}
                    </button>
                </form>
            </main>
        </div>
        <VerificationModal
          isOpen={isVerificationOpen}
          onClose={() => setIsVerificationOpen(false)}
          onVerify={handleVerificationSuccess}
          onResend={handleResendCode}
          identifier={identifier}
        />
    </div>
  );
};

export default AuthPage;