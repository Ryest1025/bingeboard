// test-server.js
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${port}/`);
  console.log(`Access the API test page at http://localhost:${port}/api-test.html`);
});
