import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  HomeIcon,
  DiscoverIcon,
  FriendsIcon,
  ProfileIcon
} from "@/components/category-icons";
import { List } from "lucide-react";

export default function MobileNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/discover", icon: DiscoverIcon, label: "Discover" },
    { path: "/lists", icon: List, label: "Lists" },
    { path: "/social", icon: FriendsIcon, label: "Social" },
    { path: "/profile", icon: ProfileIcon, label: "Profile" },
  ];

  return (
    <>
      {/* Bottom Navigation - Static (All Devices) */}
      <nav className="nav-opaque fixed bottom-0 left-0 right-0 z-[60] border-t border-white/10">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || 
              (item.path === "/" && location === "/") ||
              (item.path === "/search" && location === "/discover");
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path === "/search" ? "/discover" : item.path)}
                className={`flex flex-col items-center p-2 transition-colors ${
                  isActive ? "text-teal-400" : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>


    </>
  );
}
