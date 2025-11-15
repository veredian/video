import React, { useState, useEffect } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import { useTranslation } from '../../i18n/LanguageContext';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const totalSteps = 4;
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem('onboardingStep');
      // Don't go beyond the last step if localStorage has an old value
      const initialStep = savedStep ? Math.min(parseInt(savedStep, 10), totalSteps) : 1;
      setStep(initialStep);
    } catch (e) {
      // If localStorage fails, default to step 1
      setStep(1);
    }
  }, []);

  const updateStep = (newStep: number) => {
    setStep(newStep);
    try {
      localStorage.setItem('onboardingStep', String(newStep));
    } catch (e) {
      console.error("Failed to save onboarding step", e);
    }
  };

  const nextStep = () => updateStep(Math.min(step + 1, totalSteps));
  const prevStep = () => updateStep(Math.max(step - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      default: return <Step1 />;
    }
  };

  return (
    <div className="min-h-screen dark:text-white flex flex-col items-center justify-center p-4 font-sans bg-black">
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
        
        <header className="mb-8 w-full">
            <p className="text-sm font-semibold text-gray-400 mb-3">
                Step {step} of {totalSteps}
            </p>
            <div className="flex justify-center gap-3">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step >= index + 1 ? 'bg-cyan-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
        </header>

        <main key={step} className="animate-fade-in-up min-h-[350px] flex flex-col justify-center w-full">
            {renderStep()}
        </main>

        <footer className="mt-12 flex items-center justify-between w-full">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-6 py-2 text-gray-400 font-semibold rounded-md hover:text-white transition-colors"
            >
              Back
            </button>
          ) : (
            <div /> // Placeholder for alignment
          )}

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition-all transform hover:scale-105"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition-all transform hover:scale-105"
            >
              Go to Login
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
export default Onboarding;