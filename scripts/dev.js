const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');
const viteCli = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

if (!fs.existsSync(viteCli)) {
  console.error('Frontend dependencies are missing. Run npm run install:all first.');
  process.exit(1);
}

const envFile = path.join(backendDir, '.env');
const envExampleFile = path.join(backendDir, '.env.example');
if (!fs.existsSync(envFile) && fs.existsSync(envExampleFile)) {
  fs.copyFileSync(envExampleFile, envFile);
  console.log('Created backend/.env from .env.example');
}

const children = [
  spawn(process.execPath, ['server.js'], { cwd: backendDir, stdio: 'inherit', env: process.env }),
  spawn(process.execPath, [viteCli, '--host', '0.0.0.0'], { cwd: frontendDir, stdio: 'inherit', env: process.env })
];

let stopping = false;
function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 300);
}

for (const child of children) {
  child.on('error', (error) => {
    console.error(`Could not start a project service: ${error.message}`);
    stopAll(1);
  });
  child.on('exit', (code) => {
    if (!stopping && code !== 0) stopAll(code || 1);
  });
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
