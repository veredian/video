import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  onResend: () => void;
  email: string;
}

const SIMULATED_CODE = "123456";
const INITIAL_COOLDOWN = 30;
const RESEND_COOLDOWN = 60;


const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onVerify, onResend, email }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(INITIAL_COOLDOWN);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setResendCooldown(INITIAL_COOLDOWN);
      setResendMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && resendCooldown > 0) {
      const timerId = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (resendCooldown === 0) {
        setResendMessage(''); // Clear message once cooldown is over
    }
  }, [isOpen, resendCooldown]);


  if (!isOpen) {
    return null;
  }
  
  const handleVerify = () => {
    if(code === SIMULATED_CODE) {
        onVerify();
    } else {
        setError('Invalid verification code. Please try again.');
    }
  }

  const handleResend = () => {
    onResend();
    setResendCooldown(RESEND_COOLDOWN);
    setResendMessage('A new code has been sent.');
    setError(''); // Clear previous errors
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-title"
    >
      <div 
        className="relative w-full max-w-md m-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="verification-title" className="text-2xl font-bold text-gray-900 dark:text-white">Verify your email</h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full transition-colors"
            aria-label="Close verification"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                A verification code has been sent to <span className="font-semibold text-cyan-500">{email}</span>. Please enter the code below to complete your registration.
            </p>
            <p className="text-xs text-center p-2 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                (For this demo, the code is: <b className="tracking-wider">{SIMULATED_CODE}</b>)
            </p>
            <div>
                 <label htmlFor="code"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Code</label>
                 <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-center tracking-[0.5em] font-mono px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="_ _ _ _ _ _"
                />
            </div>
            
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            
            <button
                onClick={handleVerify}
                className="w-full flex justify-center items-center bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
                Verify & Create Account
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 h-10">
                {resendCooldown > 0 ? (
                    <span>You can resend the code in {resendCooldown} seconds.</span>
                ) : (
                    <button
                        onClick={handleResend}
                        className="text-cyan-500 hover:underline font-semibold disabled:text-gray-400 disabled:no-underline"
                        disabled={resendCooldown > 0}
                    >
                        Didn't receive a code? Resend
                    </button>
                )}
                {resendMessage && <p className="text-green-500 text-xs mt-1">{resendMessage}</p>}
            </div>
        </div>

      </div>
    </div>
  );
};

export default VerificationModal;