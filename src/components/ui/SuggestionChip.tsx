import React from 'react';

interface SuggestionChipProps {
  text: string;
  subtext?: string;
  onClick: () => void;
  className?: string;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({
  text,
  subtext,
  onClick,
  className = '',
}) => {
  return (
    <button
      className={`flex flex-col px-6 py-4 bg-white border border-gemini-borderColor rounded-xl text-left transition-all hover:shadow-gemini-button ${className}`}
      onClick={onClick}
    >
      <span className="text-sm font-medium text-gemini-text">{text}</span>
      {subtext && (
        <span className="text-xs text-gemini-secondaryText mt-1">{subtext}</span>
      )}
    </button>
  );
};

export default SuggestionChip;
