import React from 'react';
import { Button } from '@/components/ui/button';

export function EmergencyLogout() {
  const handleForceLogout = async () => {
    try {
      // Step 1: Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Step 2: Clear all cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
      
      // Step 3: Call server logout
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      }).catch(() => {});
      
      // Step 4: Hard redirect to landing page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Emergency logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  return (
    <Button 
      onClick={handleForceLogout}
      variant="destructive"
      size="sm"
      className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
    >
      🚨 FORCE LOGOUT
    </Button>
  );
}