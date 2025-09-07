import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Handle search - could navigate to search page or show results
      console.log("Searching for:", query);
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex items-center gap-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies and TV shows..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <Button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3"
        >
          Search
        </Button>
      </form>
    </div>
  );
}
