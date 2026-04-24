const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const nodemonCommand = path.join(rootDir, 'node_modules', '.bin', isWindows ? 'nodemon.cmd' : 'nodemon');
const backendPort = process.env.PORT || '3001';

const children = [];
let shuttingDown = false;

function killChildTree(child) {
  if (!child || child.exitCode !== null || child.killed) return;

  if (isWindows) {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true
    });
    killer.on('error', () => {});
    return;
  }

  child.kill('SIGTERM');
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    killChildTree(child);
  }

  setTimeout(() => process.exit(code), 300);
}

function attachChild(name, child) {
  children.push(child);

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;

    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.error(`[${name}] exited with ${reason}`);
    shutdown(code ?? 1);
  });

  child.on('error', (error) => {
    if (shuttingDown) return;

    console.error(`[${name}] failed to start: ${error.message}`);
    shutdown(1);
  });
}

const reportsFrontendExists = fs.existsSync(path.join(frontendDir, 'package.json'));

if (reportsFrontendExists && process.env.SKIP_REPORTS_FRONTEND !== '1') {
  const frontend = spawn(npmCommand, ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    windowsHide: false,
    shell: isWindows,
    env: {
      ...process.env,
      REPORTS_API_BASE_URL: process.env.REPORTS_API_BASE_URL || `http://localhost:${backendPort}`
    }
  });

  attachChild('reports', frontend);
} else if (!reportsFrontendExists) {
  console.warn('Khong tim thay frontend bao cao, bo qua viec khoi dong Next.js.');
}

const backendCommand = fs.existsSync(nodemonCommand) ? nodemonCommand : process.execPath;
const backendArgs = fs.existsSync(nodemonCommand) ? ['app.js'] : [path.join(rootDir, 'app.js')];

const backend = spawn(backendCommand, backendArgs, {
  cwd: rootDir,
  stdio: 'inherit',
  windowsHide: false,
  shell: isWindows,
  env: process.env
});

attachChild('backend', backend);

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
