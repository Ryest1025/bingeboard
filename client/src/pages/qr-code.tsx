import React from 'react';

export default function QRCode() {
  // Get the current domain for the mobile URL
  const mobileUrl = `${window.location.origin}/mobile`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(mobileUrl)}`;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            BingeBoard Mobile
          </h1>
          <p className="text-gray-300 text-lg">
            Scan this QR code with your phone to access the mobile version
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <img
            src={qrCodeUrl}
            alt="QR Code for mobile access"
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-gray-400">
          <p className="text-sm">
            📱 Open your phone's camera app
          </p>
          <p className="text-sm">
            📷 Point it at the QR code above
          </p>
          <p className="text-sm">
            🚀 Tap the notification to open BingeBoard
          </p>
        </div>

        {/* Direct Link */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">Or visit directly:</p>
          <a
            href={mobileUrl}
            className="text-teal-400 hover:text-teal-300 text-sm break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {mobileUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
