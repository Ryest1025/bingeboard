import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';

export default function AuthDebug() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAuth = async () => {
    setIsLoading(true);
    setResult('Testing...');
    
    try {
      console.log('🧪 Starting direct Firebase test...');
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        'rachel.gubin@gmail.com', 
        'password123'
      );
      
      console.log('✅ Firebase auth successful:', userCredential.user);
      
      setResult(`✅ SUCCESS! 
        Email: ${userCredential.user.email}
        UID: ${userCredential.user.uid}
        Created: ${userCredential.user.metadata.creationTime}`);
        
    } catch (error: any) {
      console.error('❌ Firebase auth failed:', error);
      setResult(`❌ FAILED: ${error.code} - ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl mb-6">🔍 Auth Debug Tool</h1>
        
        <button 
          onClick={testAuth}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded mb-4"
        >
          {isLoading ? 'Testing...' : 'Test Firebase Auth'}
        </button>
        
        <div className="bg-gray-900 p-4 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-sm whitespace-pre-wrap">{result || 'Click button to test'}</pre>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>Testing credentials:</p>
          <p>Email: rachel.gubin@gmail.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
}