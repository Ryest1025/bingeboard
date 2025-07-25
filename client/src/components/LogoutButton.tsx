// src/components/LogoutButton.tsx
import { getAuth, signOut } from 'firebase/auth';

export const LogoutButton = () => {
  const handleLogout = async () => {
    console.log('👋 LOGOUT BUTTON CLICKED!');
    const auth = getAuth();

    try {
      console.log('🔄 Signing out from Firebase...');
      await signOut(auth);
      console.log('✅ Successfully logged out from Firebase');

      // Clear any local storage tokens
      localStorage.removeItem('debugToken');
      localStorage.removeItem('devToken');

      console.log('🔄 Reloading page to refresh auth state...');
      // Reload to refresh auth state
      window.location.reload();
    } catch (error: any) {
      console.error('❌ Logout failed:', error);
      alert(`❌ Logout failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        margin: '20px',
        padding: '15px 30px',
        fontSize: '18px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      🚪 Log out
    </button>
  );
};
