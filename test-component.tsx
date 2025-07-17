// Simple test to check if our imports work
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

function TestComponent() {
  const [test, setTest] = useState(true);
  const { isAuthenticated } = useAuth();
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Auth Status: {isAuthenticated ? "Logged in" : "Not logged in"}</p>
      <p>Test State: {test ? "Working" : "Not working"}</p>
    </div>
  );
}

export default TestComponent;
