import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { X, Shield, Eye, Cookie } from "lucide-react";

interface ConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentBanner({ onAccept, onDecline }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already provided consent
    const hasConsented = localStorage.getItem('bingeboard-consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('bingeboard-consent', 'accepted');
    localStorage.setItem('bingeboard-consent-date', new Date().toISOString());
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('bingeboard-consent', 'declined');
    localStorage.setItem('bingeboard-consent-date', new Date().toISOString());
    setIsVisible(false);
    onDecline();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-black/95 backdrop-blur-sm border-t border-gray-700">
      <Card className="max-w-4xl mx-auto bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="h-5 w-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Privacy & Data Consent</h3>
                <p className="text-gray-300 text-sm mb-4">
                  We value your privacy and are committed to protecting your personal data. By using BingeBoard, 
                  you consent to our collection and use of information as described in our Privacy Policy.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Cookie className="h-4 w-4 text-teal-400" />
                    <span className="text-sm text-gray-300">Essential cookies for functionality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-teal-400" />
                    <span className="text-sm text-gray-300">Analytics to improve our service</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-teal-400" />
                    <span className="text-sm text-gray-300">Secure data encryption</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <Link href="/privacy-policy" className="text-teal-400 hover:text-teal-300 underline">
                    Privacy Policy
                  </Link>
                  <span className="text-gray-500">•</span>
                  <Link href="/terms-of-service" className="text-teal-400 hover:text-teal-300 underline">
                    Terms of Service
                  </Link>
                  <span className="text-gray-500">•</span>
                  <Link href="/eula" className="text-teal-400 hover:text-teal-300 underline">
                    EULA
                  </Link>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Accept & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function useConsent() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('bingeboard-consent');
    setHasConsented(consent === 'accepted');
  }, []);

  const updateConsent = (accepted: boolean) => {
    const value = accepted ? 'accepted' : 'declined';
    localStorage.setItem('bingeboard-consent', value);
    localStorage.setItem('bingeboard-consent-date', new Date().toISOString());
    setHasConsented(accepted);
  };

  const revokeConsent = () => {
    localStorage.removeItem('bingeboard-consent');
    localStorage.removeItem('bingeboard-consent-date');
    setHasConsented(null);
  };

  return {
    hasConsented,
    updateConsent,
    revokeConsent
  };
}