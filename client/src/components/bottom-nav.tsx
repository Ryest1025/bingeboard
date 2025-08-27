import React from "react";
import { Home, Search, List, Users } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { href: "/discover", label: "Discover", icon: <Search className="w-5 h-5" /> },
    { href: "/watchlist", label: "Watchlist", icon: <List className="w-5 h-5" /> },
    { href: "/friends", label: "Friends", icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 md:hidden">
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href} 
              className={`flex flex-col items-center justify-center text-xs px-2 py-2 transition-colors ${
                location === item.href ? 'text-teal-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
