import React from 'react';

export function BingeHighlightHeader({ children }) {
  // Split text around the word "Binge"
  const parts = children.split(/(Binge)/);

  return (
    <h1 className="text-3xl font-bold text-white mb-6 select-none">
      {parts.map((part, i) =>
        part === 'Binge' ? (
          <span
            key={i}
            className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </h1>
  );
}
