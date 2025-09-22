// src/components/LoginButton.tsx
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase/config'; // Use centralized auth instance

export const LoginButton = () => {
  const handleLogin = async () => {
    console.log('🚀 LOGIN BUTTON CLICKED!');
    const provider = new GoogleAuthProvider();

    try {
      console.log('🔑 Starting Firebase login...');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      console.log('✅ Logged in:', user.email);
      console.log('🔐 Token (first 20 chars):', token.substring(0, 20) + '...');
      
      // Test the API call immediately with better error handling
      const response = await fetch('/api/auth/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        try {
          const userData = await response.json();
          console.log('✅ API call successful:', userData);
          alert(`🎉 LOGIN SUCCESS! Welcome ${user.email}`);
          window.location.reload(); // Refresh to update auth state
        } catch (jsonError) {
          console.error('❌ Failed to parse response as JSON:', jsonError);
          const text = await response.text();
          console.error('❌ Response was:', text);
          alert(`⚠️ Login successful but got unexpected response format`);
        }
      } else {
        console.error('❌ API call failed:', response.status);
        const responseText = await response.text();
        console.error('❌ Error response:', responseText);
        
        // Check if we got HTML instead of JSON
        if (responseText.startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
          console.error('❌ Got HTML instead of JSON - backend route might be missing');
          alert(`⚠️ Backend API not configured correctly (got HTML instead of JSON)`);
        } else {
          alert(`⚠️ Login successful but API call failed: ${response.status}`);
        }
      }
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      alert(`❌ Login failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <button 
      onClick={handleLogin} 
      style={{ 
        margin: '20px', 
        padding: '15px 30px',
        fontSize: '18px',
        backgroundColor: '#4285f4',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      🔐 Sign in with Google (WORKING)
    </button>
  );
};
