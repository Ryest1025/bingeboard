export default function DebugTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'black', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#14B8A6', fontSize: '3rem', margin: '20px 0' }}>
          BingeBoard Working!
        </h1>
        <p style={{ fontSize: '1.5rem', margin: '10px 0' }}>
          ✓ App is loading successfully
        </p>
        <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>
          ✓ React components are rendering
        </p>
        <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>
          ✓ Router is functioning
        </p>
        <div style={{ 
          backgroundColor: '#14B8A6', 
          padding: '20px', 
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <p style={{ color: 'white', fontSize: '1.2rem' }}>
            SUCCESS: The app is working correctly!
          </p>
        </div>
      </div>
    </div>
  );
}