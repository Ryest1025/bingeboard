import React from "react";

export default function SimpleAuthMinimal() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-lg">
        <h1 className="text-white text-2xl mb-4">BingeBoard</h1>
        <button 
          onClick={() => console.log('Google button clicked')}
          className="w-full bg-white text-black p-3 rounded mb-4"
        >
          Continue with Google
        </button>
        <button 
          onClick={() => console.log('Facebook button clicked')}
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          Continue with Facebook
        </button>
      </div>
    </div>
  );
}
