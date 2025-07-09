import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Tv, 
  Search, 
  Calendar,
  Heart,
  UserCircle,
  Settings,
  Shield,
  FileText,
  Smartphone
} from "lucide-react";

export default function DesktopFooter() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Tv, label: "Home" },
    { path: "/discover", icon: Search, label: "Discover" },
    { path: "/upcoming", icon: Calendar, label: "Upcoming" },
    { path: "/activity", icon: Heart, label: "Activity" },
    { path: "/profile", icon: UserCircle, label: "Profile" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const legalLinks = [
    { path: "/privacy-policy", icon: Shield, label: "Privacy Policy" },
    { path: "/terms-of-service", icon: FileText, label: "Terms of Service" },
    { path: "/eula", icon: Smartphone, label: "EULA" },
  ];

  return (
    <>
      {/* Static Navigation Bar - Fixed at bottom */}
      <nav className="hidden md:block fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-40">
        <div className="flex justify-center space-x-8 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || 
              (item.path === "/" && location === "/") ||
              (item.path === "/search" && location === "/discover");
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path === "/search" ? "/discover" : item.path)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                  isActive 
                    ? "text-teal-400 bg-teal-400/10" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Content - At bottom of page content */}
      <footer className="hidden md:block bg-gray-900/95 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-white font-bold text-lg mb-2">BingeBoard</h3>
              <p className="text-gray-400 text-sm">
                The premium platform for tracking your favorite TV shows and sporting events. 
                Discover, track, and share your entertainment experience.
              </p>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <div className="space-y-2">
                {legalLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.path}
                      onClick={() => setLocation(link.path)}
                      className="flex items-center text-gray-400 hover:text-teal-400 text-sm transition-colors"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Privacy questions: privacy@bingeboard.com</p>
                <p>Support: support@bingeboard.com</p>
                <p className="mt-4 text-xs">
                  © 2025 BingeBoard. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}