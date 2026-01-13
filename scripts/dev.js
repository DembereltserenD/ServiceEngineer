#!/usr/bin/env node
// This script wraps Next.js dev server to handle Tempo's --host flag
// Tempo platform passes --host which Next.js 16+ doesn't recognize (it uses --hostname or -H)

const { spawn } = require('child_process');

const args = process.argv.slice(2);

// Convert --host to --hostname for Next.js compatibility
const convertedArgs = args.map(arg => {
  if (arg === '--host') return '--hostname';
  return arg;
});

// Add default hostname if not provided
if (!convertedArgs.includes('--hostname') && !convertedArgs.includes('-H')) {
  convertedArgs.push('--hostname', '0.0.0.0');
}

const nextDev = spawn('npx', ['next', 'dev', ...convertedArgs], {
  stdio: 'inherit',
  shell: true
});

nextDev.on('error', (err) => {
  console.error('Failed to start Next.js dev server:', err);
  process.exit(1);
});

nextDev.on('close', (code) => {
  process.exit(code);
});
