import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 BYPASS MAIN - Starting BingeBoard');

// Create root and render immediately
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ BingeBoard app rendered successfully');
  
  // Remove any loading screens
  setTimeout(() => {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.remove();
    }
  }, 100);
} else {
  console.error('❌ Root element not found');
}