import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StreamingPlatformSelectorProps {
  providers: any[];
  onSelectPlatform: (platform: any) => void;
}

export const StreamingPlatformSelector: React.FC<StreamingPlatformSelectorProps> = ({ 
  providers = [], 
  onSelectPlatform 
}) => {
  if (!providers || providers.length === 0) {
    return (
      <Button 
        size="sm" 
        className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/50 text-xs h-6 px-2"
        onClick={() => {
          // Fallback search on Google
          window.open(`https://www.google.com/search?q=where+to+watch+streaming`, '_blank');
        }}
      >
        <Eye className="h-3 w-3 mr-1" />
        Watch Now
      </Button>
    );
  }

  // Single platform - direct button
  if (providers.length === 1) {
    return (
      <Button 
        size="sm" 
        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50 text-xs h-6 px-2"
        onClick={() => onSelectPlatform(providers[0])}
      >
        <Eye className="h-3 w-3 mr-1" />
        {providers[0].provider_name}
      </Button>
    );
  }

  // Multiple platforms - dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50 text-xs h-6 px-2"
        >
          <Eye className="h-3 w-3 mr-1" />
          Watch Now
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {providers.map((provider: any) => (
          <DropdownMenuItem
            key={provider.provider_id}
            onClick={() => onSelectPlatform(provider)}
            className="flex items-center gap-2"
          >
            <img
              src={provider.logo_path ? `https://image.tmdb.org/t/p/w45${provider.logo_path}` : '/placeholder-logo.png'}
              alt={provider.provider_name}
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span>{provider.provider_name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};