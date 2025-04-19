import React from 'react';

interface ScholarlyLogoProps {
  withText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ScholarlyLogo: React.FC<ScholarlyLogoProps> = ({
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
      <span className={`font-bold ${withText ? sizeMap[size] : ''} scholarly-logo-text`}>
        {withText ? 'Scholarly' : 'S'}
      </span>
      {withText && (
        <span className="font-semibold text-scholarly-text ml-2 align-bottom">
          Insight
        </span>
      )}
    </div>
  );
};

export default ScholarlyLogo;
