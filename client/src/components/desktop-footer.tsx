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
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${isActive
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
              <div className="flex items-center space-x-3 mb-4">
                {/* TV Logo - matching header */}
                <div className="relative">
                  <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                    <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                      <div
                        className="text-sm font-bold text-white drop-shadow-lg"
                        style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}
                      >
                        B
                      </div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
                  </div>
                </div>

                {/* Brand Name - matching header */}
                <div className="block">
                  <span className="text-xl select-none">
                    <span className="font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Binge
                    </span>
                    <span className="font-light text-white ml-1">Board</span>
                  </span>
                </div>
              </div>
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