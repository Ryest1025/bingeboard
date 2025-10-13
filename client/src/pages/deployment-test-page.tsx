import React from 'react';

// NUCLEAR TEST - October 13, 2025 6:35pm
// If you see this, the deployment is finally working!
const TestDeployment: React.FC = () => {
  console.log('🚨🚨🚨 NUCLEAR TEST SUCCESS - October 13, 2025 6:35pm 🚨🚨🚨');
  console.log('🎯 Deployment is working! This is the test page.');
  
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#000', 
      color: '#fff', 
      textAlign: 'center',
      minHeight: '100vh',
      fontSize: '2rem'
    }}>
      <h1>🚨 DEPLOYMENT TEST SUCCESS</h1>
      <p>October 13, 2025 6:35pm</p>
      <p>If you see this page, deployment is working!</p>
      <p>Check console for debug messages.</p>
    </div>
  );
};

export default TestDeployment;