import React from 'react';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange, disabled = false }) => {
  return (
    <label htmlFor={label} className={`flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <input 
          id={label} 
          type="checkbox" 
          className="sr-only" 
          checked={enabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'opacity-50' : ''}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;