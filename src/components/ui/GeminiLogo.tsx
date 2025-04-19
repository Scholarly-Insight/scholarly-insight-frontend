import React from 'react';

interface GeminiLogoProps {
  withText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GeminiLogo: React.FC<GeminiLogoProps> = ({
  withText = true,
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <span className={`font-bold ${withText ? sizeMap[size] : ''} gemini-logo-text`}>
        {withText ? 'Gemini' : 'G'}
      </span>
      {withText && (
        <span className="text-xs text-gemini-secondaryText ml-2 align-bottom">
          2.0 Flash
        </span>
      )}
    </div>
  );
};

export default GeminiLogo;
