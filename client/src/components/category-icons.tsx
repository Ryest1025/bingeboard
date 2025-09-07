// Standardized category icons for consistent use across the app
export function TrendingIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 9V7l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 7h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function PopularIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.9"/>
      <circle cx="12" cy="12" r="1.5" fill="white"/>
    </svg>
  );
}

export function TopRatedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1.5" fill="currentColor"/>
      <polygon points="12,6 13.5,9.5 17,10 14.5,12.5 15.27,16 12,14.27 8.73,16 9.5,12.5 7,10 10.5,9.5" fill="white"/>
    </svg>
  );
}

export function ComingSoonIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="15" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function RecommendationsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <path d="m17 7 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="m21 3-1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="m21 3 1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function UpcomingIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="6" r="1" fill="currentColor"/>
    </svg>
  );
}

export function FriendsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function DiscoverIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 2l9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="9" y="13" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function ActivityIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M21 8.5c0-2.5-2-4.5-4.5-4.5S12 6 12 8.5c0 1.5.7 2.8 1.8 3.6L12 22l-1.8-9.9C11.3 11.3 12 10 12 8.5c0-2.5-2-4.5-4.5-4.5S3 6 3 8.5c0 1.5.7 2.8 1.8 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7.5" cy="8.5" r="1.5" fill="currentColor"/>
      <circle cx="16.5" cy="8.5" r="1.5" fill="currentColor"/>
    </svg>
  );
}

export function ProfileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 20.66C8.8 18.38 10.34 17 12 17s3.2 1.38 5 3.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}