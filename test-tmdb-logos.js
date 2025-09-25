// Test TMDB logo URLs
const tmdbLogoExamples = [
  "/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg", // Hulu
  "/h5DcR0J2EESLitnhR8xLG1QymTE.jpg", // Paramount+
  "/9BgaNQRMDvVlji1JBZi6tcfxpKx.jpg", // fuboTV
];

console.log("Testing TMDB logo URLs:");
tmdbLogoExamples.forEach(logoPath => {
  const fullUrl = `https://image.tmdb.org/t/p/w92${logoPath}`;
  console.log(`Logo URL: ${fullUrl}`);
});

// Test the new getPlatformLogo function behavior
console.log("\nTesting getPlatformLogo function with TMDB paths:");
console.log("getPlatformLogo('Hulu', '/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg') should return:", 
  `https://image.tmdb.org/t/p/w92/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg`);