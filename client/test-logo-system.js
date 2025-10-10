// Test script to verify logo system is working
console.log("🧪 Testing logo system...");

// Test the platform logo mapping
const platforms = [
  'Netflix',
  'Prime Video', 
  'Disney+',
  'Max',
  'Apple TV+',
  'Hulu',
  'Paramount+',
  'Peacock',
  'Crunchyroll'
];

platforms.forEach(platform => {
  // Test the actual logo path
  const logoUrl = `/logos/${platform.toLowerCase().replace(/\+/g, '-plus').replace(/ /g, '-')}.png`;
  
  const img = new Image();
  img.onload = () => console.log(`✅ ${platform}: ${logoUrl} - LOADED`);
  img.onerror = () => console.log(`❌ ${platform}: ${logoUrl} - FAILED`);
  img.src = logoUrl;
});

// Test the getPlatformLogo function if available
if (window.getPlatformLogo) {
  platforms.forEach(platform => {
    const result = window.getPlatformLogo(platform);
    console.log(`🔍 getPlatformLogo("${platform}") => ${result}`);
  });
}