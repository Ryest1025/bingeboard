// Error monitoring script
import { spawn } from 'child_process';
import fs from 'fs';

// Start the server
const server = spawn('npx', ['vite', '--host', '0.0.0.0'], { 
  cwd: './client',
  shell: true,
  stdio: 'pipe'
});

console.log('Starting Vite server with error monitoring...');

// Create error log file
const errorLogStream = fs.createWriteStream('vite-errors.log', { flags: 'a' });

// Log stderr
server.stderr.on('data', (data) => {
  const output = data.toString();
  console.error(`\n[ERROR] ${output}`);
  errorLogStream.write(`[ERROR] ${output}\n`);
});

// Handle server exit
server.on('close', (code) => {
  console.log(`\nServer process exited with code ${code}`);
  errorLogStream.write(`[EXIT] Server process exited with code ${code}\n`);
  errorLogStream.end();
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit();
});

console.log('Error monitoring active. Press Ctrl+C to stop.');
