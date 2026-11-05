const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');

function run(command, args, cwd) {
  console.log(`\n> Running: ${command} ${args.join(' ')} in ${path.relative(root, cwd) || '.'}`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`Command failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log('--- [1/3] Installing Backend Dependencies ---');
run('npm', ['install'], backendDir);

console.log('--- [2/3] Installing Frontend Dependencies ---');
run('npm', ['install'], frontendDir);

console.log('--- [3/3] Building Frontend Production Assets ---');
run('npm', ['run', 'build'], frontendDir);

const distIndex = path.join(frontendDir, 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  console.error('Error: frontend/dist/index.html was not created!');
  process.exit(1);
}

console.log('\n✅ Build complete! Ready for Render deployment.');

