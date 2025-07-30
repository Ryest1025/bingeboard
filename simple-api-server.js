// Simple test server for the API
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Configure CORS with more detailed options
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://0.0.0.0:3000',
    'http://localhost:5173',  // Vite dev server
    'http://0.0.0.0:5173',    // Vite dev server
    // Allow GitHub Codespaces domains
    /\.app\.github\.dev$/,
    /\.github\.dev$/,
    /\.codespaces\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Allow cookies to be sent with requests
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Enable CORS preflight for all routes
app.options('*', cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`📝 Headers: ${JSON.stringify(req.headers)}`);
  
  // Add CORS headers to every response as a fallback
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  console.log('🔐 Mock authentication middleware');
  console.log('🔐 Headers:', req.headers);
  
  // Add a mock user to the request
  req.user = {
    id: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  };
  
  next();
};

// Lists endpoint
app.get('/api/lists', mockAuth, (req, res) => {
  try {
    const type = req.query.type || 'my';
    console.log(`📋 Fetching lists of type: ${type}`);
    
    // Mock data for different list types
    const mockLists = {
      my: [
        {
          id: 1,
          name: "My Watchlist",
          shows: [
            {
              id: 101,
              title: "Stranger Things",
              poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
              description: "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
              trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
              affiliateUrl: "https://www.netflix.com/title/80057281"
            },
            {
              id: 102,
              title: "The Mandalorian",
              poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
              description: "After the fall of the Galactic Empire, lawlessness has spread throughout the galaxy. A lone gunfighter makes his way through the outer reaches, earning his keep as a bounty hunter.",
              trailerUrl: "https://www.youtube.com/watch?v=aOC8E8z_ifw",
              affiliateUrl: "https://www.disneyplus.com/series/the-mandalorian/3jLIGMDYINqD"
            }
          ]
        },
        {
          id: 2,
          name: "Recently Watched",
          shows: [
            {
              id: 103,
              title: "The Witcher",
              poster: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
              description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
              trailerUrl: "https://www.youtube.com/watch?v=ndl1W4ltcmg",
              affiliateUrl: "https://www.netflix.com/title/80189685"
            },
            {
              id: 104,
              title: "The Boys",
              poster: "https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg",
              description: "A group of vigilantes known informally as 'The Boys' set out to take down corrupt superheroes with no more than blue-collar grit and a willingness to fight dirty.",
              trailerUrl: "https://www.youtube.com/watch?v=tcrNsIaQkb4",
              affiliateUrl: "https://www.amazon.com/The-Boys-Season-1/dp/B07QNJCXZK"
            }
          ]
        }
      ],
      genre: [
        {
          id: 3,
          name: "Sci-Fi",
          shows: [
            {
              id: 105,
              title: "Foundation",
              poster: "https://image.tmdb.org/t/p/w500/7nxxeU1AlQzIKH6LuJpnM8qQVR.jpg",
              description: "A complex saga of humans scattered on planets throughout the galaxy all living under the rule of the Galactic Empire.",
              trailerUrl: "https://www.youtube.com/watch?v=X4QYV5GTz7c",
              affiliateUrl: "https://tv.apple.com/us/show/foundation/umc.cmc.5983fipzqbicvrve6jdfep4x3"
            }
          ]
        }
      ],
      network: [
        {
          id: 4,
          name: "Netflix Originals",
          shows: []
        }
      ],
      coming: [
        {
          id: 5,
          name: "Coming Soon",
          shows: []
        }
      ],
      custom: [
        {
          id: 6,
          name: "My Custom List",
          shows: []
        }
      ]
    };
    
    res.json(mockLists[type] || []);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a simple test HTML page for direct browser testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lists API Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        button { padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>Lists API Test</h1>
      <div>
        <button onclick="fetchLists('my')">Get My Lists</button>
        <button onclick="fetchLists('genre')">Get Genre Lists</button>
        <button onclick="fetchLists('network')">Get Network Lists</button>
        <button onclick="fetchLists('coming')">Get Coming Soon</button>
      </div>
      <h3>Response:</h3>
      <pre id="result">Click a button to test the API...</pre>
      
      <script>
        async function fetchLists(type) {
          const resultElement = document.getElementById('result');
          resultElement.textContent = 'Loading...';
          resultElement.className = '';
          
          try {
            const response = await fetch(\`/api/lists?type=\${type}\`, {
              headers: {
                'Authorization': 'Bearer test-token'
              }
            });
            
            if (!response.ok) {
              throw new Error(\`HTTP error! Status: \${response.status}\`);
            }
            
            const data = await response.json();
            resultElement.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            resultElement.textContent = \`Error: \${error.message}\`;
            resultElement.className = 'error';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Test server running at http://localhost:${PORT}`);
});
