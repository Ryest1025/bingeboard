import { Link, useLocation } from "wouter";
import { Tv } from "lucide-react";

export default function SimpleNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/discover", label: "Discover" },
    { path: "/upcoming", label: "Upcoming" },
    { path: "/friends", label: "Binge Friends" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-binge-charcoal/95 backdrop-blur-md border-b border-binge-gray">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-black text-lg tracking-tight">B</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Binge<span className="font-light">Board</span>
              </h1>
              <div className="text-[10px] text-teal-400 font-medium tracking-widest uppercase opacity-75 -mt-1">
                Entertainment Hub
              </div>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors ${
                  location === item.path
                    ? "text-binge-purple"
                    : "text-muted-foreground hover:text-binge-purple"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}