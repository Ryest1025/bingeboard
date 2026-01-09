/**
 * Trailer Modal Component
 * Simple modal for displaying trailers with pre-roll ads
 */

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import AdPlayer from './ad-player';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  embedUrl: string;
  thumbnail?: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  title,
  embedUrl,
  thumbnail,
}) => {
  const [loading, setLoading] = useState(true);
  const [showAd, setShowAd] = useState(true);
  const [adCompleted, setAdCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLoading(true);
      setShowAd(true);
      setAdCompleted(false);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleAdComplete = () => {
    setShowAd(false);
    setAdCompleted(true);
  };

  const handleSkipAd = () => {
    setShowAd(false);
    setAdCompleted(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Video Content */}
        <div className="relative aspect-video bg-black">
          {showAd ? (
            /* Show Ad Before Trailer */
            <div className="w-full h-full flex flex-col items-center justify-center p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-400">
                  Watch a short ad to continue to the trailer
                </p>
              </div>
              <AdPlayer
                onAdComplete={handleAdComplete}
                onSkip={handleSkipAd}
                className="w-full max-w-3xl"
              />
            </div>
          ) : (
            /* Show Trailer After Ad */
            <>
              {adCompleted && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                    Ad completed! Enjoy your trailer.
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Loading trailer...</p>
                  </div>
                </div>
              )}
              
              <iframe
                src={embedUrl}
                title={title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Press <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">ESC</kbd> to close
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Global trailer modal manager
let globalModalController: {
  open: (props: Omit<TrailerModalProps, 'isOpen' | 'onClose'>) => void;
  close: () => void;
} | null = null;

export const TrailerModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalProps, setModalProps] = useState<TrailerModalProps | null>(null);

  useEffect(() => {
    globalModalController = {
      open: (props) => {
        setModalProps({
          ...props,
          isOpen: true,
          onClose: () => setModalProps(null),
        });
      },
      close: () => setModalProps(null),
    };

    // Listen for custom events from the trailer service
    const handleOpenTrailerModal = (event: CustomEvent) => {
      globalModalController?.open(event.detail);
    };

    window.addEventListener('openTrailerModal', handleOpenTrailerModal as EventListener);

    // Handle ESC key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalProps?.isOpen) {
        globalModalController?.close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('openTrailerModal', handleOpenTrailerModal as EventListener);
      document.removeEventListener('keydown', handleKeyDown);
      globalModalController = null;
    };
  }, [modalProps?.isOpen]);

  return (
    <>
      {children}
      {modalProps && <TrailerModal {...modalProps} />}
    </>
  );
};

// Export utility functions
export const openTrailerModal = (props: Omit<TrailerModalProps, 'isOpen' | 'onClose'>) => {
  globalModalController?.open(props);
};

export const closeTrailerModal = () => {
  globalModalController?.close();
};