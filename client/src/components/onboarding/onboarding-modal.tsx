import { useEffect } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  // Auto-complete onboarding immediately when opened
  useEffect(() => {
    if (isOpen) {
      onComplete();
    }
  }, [isOpen, onComplete]);

  // Don't render anything - onboarding is disabled
  return null;
}