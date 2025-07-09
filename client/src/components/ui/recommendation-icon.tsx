interface RecommendationIconProps {
  className?: string;
  size?: number;
}

export function RecommendationIcon({ className = "", size = 24 }: RecommendationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simple sparkle/star shape */}
      <path
        d="M12 2 L14.4 8.4 L22 8.4 L16.8 12.6 L19.2 19 L12 14.8 L4.8 19 L7.2 12.6 L2 8.4 L9.6 8.4 Z"
        fill="currentColor"
        opacity="0.9"
      />
      
      {/* Small accent sparkles */}
      <circle cx="4" cy="6" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="4" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="19" cy="18" r="1.2" fill="currentColor" opacity="0.6" />
      <circle cx="6" cy="20" r="0.9" fill="currentColor" opacity="0.5" />
    </svg>
  );
}