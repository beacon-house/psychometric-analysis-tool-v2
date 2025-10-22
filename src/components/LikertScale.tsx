// Universal Likert Scale component for all psychometric tests
// Displays 5-point scale with color-coded buttons and labels

import React from 'react';
import '../styles/LikertScale.css';

interface LikertOption {
  value: number;
  label: string;
  shortLabel: string;
}

interface LikertScaleProps {
  options: LikertOption[];
  selectedValue?: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
}

export const LikertScale: React.FC<LikertScaleProps> = ({
  options,
  selectedValue,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="likert-scale">
      {options.map(option => (
        <button
          key={option.value}
          className={`likert-button likert-${option.value} ${
            selectedValue === option.value ? 'selected' : ''
          }`}
          onClick={() => onSelect(option.value)}
          disabled={disabled}
          type="button"
        >
          <span className="likert-value">{option.value}</span>
          <span className="likert-label">{option.shortLabel}</span>
        </button>
      ))}
    </div>
  );
};
