import React from "react";

type ProviderLogoProps = {
  logoPath?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const ProviderLogo: React.FC<ProviderLogoProps> = ({ 
  logoPath, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const baseUrl = "https://image.tmdb.org/t/p/w92"; // small logos
  // Handle both full URLs and TMDB paths
  const src = logoPath ? 
    (logoPath.startsWith('http') ? logoPath : `${baseUrl}${logoPath}`) 
    : null;

  // Size mapping
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm'
  };

  // Debug logging
  console.log(`🎭 ProviderLogo Debug for ${name}:`, {
    logoPath,
    src,
    size,
    className
  });

  return (
    <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="object-contain w-full h-full rounded-lg"
          onError={(e) => {
            console.warn(`⚠️ Failed to load logo for ${name}:`, src);
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-white ${textSizeClasses[size]} font-medium text-center px-1">${name}</span>`;
            }
          }}
          onLoad={() => {
            console.log(`✅ Successfully loaded logo for ${name}:`, src);
          }}
        />
      ) : (
        <span className={`text-white ${textSizeClasses[size]} font-medium text-center px-1`}>
          {name}
        </span>
      )}
    </div>
  );
};

export default ProviderLogo;