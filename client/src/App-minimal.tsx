import React from 'react';

console.log("App-minimal.tsx loaded");

function App() {
  console.log("🎯 App component rendering...");
  console.log("App function called successfully");
  
  // Use React.createElement instead of JSX to test
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, React.createElement('div', {
    style: { textAlign: 'center' }
  }, 
    React.createElement('h1', {
      style: {
        color: '#14b8a6',
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }
    }, 'BingeBoard'),
    React.createElement('p', {
      style: { fontSize: '1.5rem', marginBottom: '0.5rem' }
    }, 'App loaded successfully!'),
    React.createElement('p', {
      style: { color: '#9ca3af' }
    }, 'React components working')
  ));
}

export default App;