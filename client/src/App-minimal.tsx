import React from 'react';

export default function App() {
  console.log("🚀 App component rendering");
  
  React.useEffect(() => {
    console.log("🚀 App component mounted");
    // Force visibility
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#000';
    
    // Remove any potential loading overlays
    const allLoadingElements = document.querySelectorAll('[class*="loading"], [id*="loading"]');
    allLoadingElements.forEach(el => el.remove());
    
    return () => {
      console.log("🚀 App component unmounting");
    };
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'red',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>MINIMAL APP WORKING</h1>
        <p>React is rendering successfully!</p>
      </div>
    </div>
  );
}