export default function LoginMinimal() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'black', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
          Minimal Login Test
        </h1>
        <p style={{ marginBottom: '20px', color: '#9CA3AF' }}>
          This is a completely minimal login page to test if the basic routing works.
        </p>
        <button 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#14B8A6', 
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}