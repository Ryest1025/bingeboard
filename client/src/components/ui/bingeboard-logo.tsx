import React from 'react';

interface BingeboardLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'monochrome' | 'gradient';
  className?: string;
}

export const BingeboardLogo: React.FC<BingeboardLogoProps> = ({
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const sizeMap = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 }
  };

  const { width, height } = sizeMap[size];

  const getColors = () => {
    switch (variant) {
      case 'monochrome':
        return {
          primary: '#FFFFFF',
          secondary: '#FFFFFF',
          holes: '#000000'
        };
      case 'gradient':
        return {
          primary: 'url(#gradient)',
          secondary: 'url(#gradient)',
          holes: '#FFFFFF'
        };
      default:
        return {
          primary: '#3B82F6', // Blue
          secondary: '#22D3EE', // Cyan
          holes: '#FFFFFF'
        };
    }
  };

  const colors = getColors();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {variant === 'gradient' && (
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>
      )}
      
      {/* Main B Shape */}
      <path
        d="M15 10 L15 130 L60 130 Q85 130 85 110 Q85 95 70 90 Q85 85 85 65 Q85 45 60 45 L40 45 L40 10 L15 10 Z"
        fill={colors.primary}
      />
      
      {/* Top Film Reel Circle */}
      <circle
        cx="62"
        cy="65"
        r="22"
        fill={colors.secondary}
      />
      
      {/* Top Film Reel Holes */}
      <circle cx="62" cy="55" r="3" fill={colors.holes} />
      <circle cx="72" cy="60" r="3" fill={colors.holes} />
      <circle cx="72" cy="70" r="3" fill={colors.holes} />
      <circle cx="62" cy="75" r="3" fill={colors.holes} />
      <circle cx="52" cy="70" r="3" fill={colors.holes} />
      <circle cx="52" cy="60" r="3" fill={colors.holes} />
      <circle cx="62" cy="65" r="2" fill={colors.holes} />
      
      {/* Bottom Film Reel Circle */}
      <circle
        cx="62"
        cy="105"
        r="22"
        fill={colors.secondary}
      />
      
      {/* Bottom Film Reel Holes */}
      <circle cx="62" cy="95" r="3" fill={colors.holes} />
      <circle cx="72" cy="100" r="3" fill={colors.holes} />
      <circle cx="72" cy="110" r="3" fill={colors.holes} />
      <circle cx="62" cy="115" r="3" fill={colors.holes} />
      <circle cx="52" cy="110" r="3" fill={colors.holes} />
      <circle cx="52" cy="100" r="3" fill={colors.holes} />
      <circle cx="62" cy="105" r="2" fill={colors.holes} />
      
      {/* Film strip detail on bottom reel */}
      <path
        d="M45 120 Q50 125 55 120"
        stroke={colors.holes}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
};

export default BingeboardLogo;
