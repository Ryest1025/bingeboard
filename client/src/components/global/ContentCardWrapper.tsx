// Utility to help migrate existing card components to UniversalShowCard
// This provides a compatibility layer for existing props and patterns

import UniversalShowCard from "@/components/global/UniversalShowCard";
import React from "react";

interface LegacyShowCardProps {
  show: any;
  onClick?: (show: any) => void;
  onAddToWatchlist?: (show: any) => void;
  onWatchNow?: (show: any) => void;
  onRemoveFromList?: (show: any) => void;
  prefetchOnHover?: boolean;
  className?: string;
}

// Wrapper for legacy ContentCard usage
export function ContentCard({ 
  show, 
  onClick, 
  onAddToWatchlist, 
  onWatchNow, 
  onRemoveFromList,
  prefetchOnHover,
  className 
}: LegacyShowCardProps) {
  // The onClick functionality is now handled by the modal in UniversalShowCard
  // onWatchNow is now handled within the modal
  // prefetchOnHover is handled automatically
  
  return (
    <UniversalShowCard
      show={show}
      className={className}
      onAddToList={onAddToWatchlist}
      onRemoveFromList={onRemoveFromList}
    />
  );
}

// Alternative wrapper for different naming conventions
export function ShowCard(props: LegacyShowCardProps) {
  return <ContentCard {...props} />;
}

export function MovieCard(props: LegacyShowCardProps) {
  return <ContentCard {...props} />;
}

export function SeriesCard(props: LegacyShowCardProps) {
  return <ContentCard {...props} />;
}

export default ContentCard;
