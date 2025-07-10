import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function LoginTest() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Login Test Page</h1>
          <p className="text-gray-400 mb-6">This is a simple test to verify the login route is working.</p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => setLocation("/")}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Go to Home
            </Button>
            
            <Button 
              onClick={() => setLocation("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Go to Full Login Page
            </Button>
            
            <div className="text-xs text-gray-500 mt-4">
              <p>Current URL: {window.location.pathname}</p>
              <p>Time: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}