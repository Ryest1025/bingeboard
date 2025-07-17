// Simple log server output script
import { spawn } from 'child_process';
import fs from 'fs';

// Start the server
const server = spawn('npx', ['vite'], { 
  cwd: './client',
  shell: true,
  stdio: 'pipe'
});

console.log('Starting Vite server in debug mode...');

// Create log file
const logStream = fs.createWriteStream('vite-server.log', { flags: 'a' });

// Log stdout
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  logStream.write(`[STDOUT] ${output}\n`);
});

// Log stderr
server.stderr.on('data', (data) => {
  const output = data.toString();
  console.error(`[ERROR] ${output}`);
  logStream.write(`[STDERR] ${output}\n`);
});

// Handle server exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  logStream.write(`[EXIT] Server process exited with code ${code}\n`);
  logStream.end();
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit();
});
