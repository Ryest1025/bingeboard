import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  HomeIcon,
  DiscoverIcon,
  FriendsIcon,
  ProfileIcon
} from "@/components/category-icons";
import { List, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNav() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Only show mobile nav if user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/discover", icon: DiscoverIcon, label: "Discover" },
    { path: "/lists", icon: List, label: "Lists" },
    { path: "/social", icon: FriendsIcon, label: "Social" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path ||
              (item.path === "/" && location === "/") ||
              (item.path === "/discover" && location.startsWith("/discover"));

            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center p-2 min-w-0 flex-1 transition-colors duration-200 ${isActive
                  ? "text-teal-400"
                  : "text-gray-400 hover:text-gray-300"
                  }`}
              >
                <Icon className="w-5 h-5 mb-1 flex-shrink-0" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="md:hidden h-16"></div>
    </>
  );
}
