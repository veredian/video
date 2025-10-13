import React, { useState } from 'react';
import { authService, User } from '../services/authService';
import { FilmIcon } from './icons/FilmIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import VerificationModal from './VerificationModal';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (mode === 'login') {
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.message);
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
        setSuccessMessage(result.message);
        setMode('login'); // Switch to login tab after successful signup
        setPassword('');
    } else {
        setError(result.message);
    }
    setIsLoading(false);
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md">
            <header className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <FilmIcon className="w-10 h-10 text-cyan-500" />
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                        Video Hub
                    </h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Sign in or create an account to continue.
                </p>
            </header>
            
            <main className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 border border-gray-300 dark:border-gray-700">
                <div className="flex border-b border-gray-300 dark:border-gray-600 mb-6">
                    <button onClick={() => switchMode('login')} className={`flex-1 py-2 text-center font-semibold transition-colors duration-200 ${mode === 'login' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-400'}`}>
                        Login
                    </button>
                    <button onClick={() => switchMode('signup')} className={`flex-1 py-2 text-center font-semibold transition-colors duration-200 ${mode === 'signup' ? 'text-cyan-500 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-cyan-400'}`}>
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    {successMessage && <p className="text-sm text-green-500 text-center">{successMessage}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading && <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />}
                        {mode === 'login' ? 'Log In' : 'Create Account'}
                    </button>
                </form>
            </main>
        </div>
        <VerificationModal 
            isOpen={showVerification}
            onClose={() => setShowVerification(false)}
            onVerify={handleVerificationSuccess}
            email={email}
        />
    </div>
  );
};

export default AuthPage;
