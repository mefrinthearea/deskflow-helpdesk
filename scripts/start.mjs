import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.join(root, 'backend');
const frontend = path.join(root, 'frontend');
const vite = path.join(frontend, 'node_modules', 'vite', 'bin', 'vite.js');

if (!existsSync(path.join(backend, 'node_modules')) || !existsSync(vite)) {
  console.error('Dependencies missing. Run "npm ci" in backend/ and frontend/ once.');
  process.exit(1);
}

const processes = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
  process.exitCode = code;
}

function launch(name, cwd, file) {
  const child = spawn(process.execPath, [file], {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
  processes.push(child);
  child.on('error', (error) => {
    console.error(`${name} failed: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.error(`${name} exited (${signal || code}). Stopping DeskFlow.`);
      stop(code || 1);
    }
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

console.log('Starting DeskFlow backend and frontend. Press Ctrl+C to stop both.');
launch('Express backend', backend, 'server.js');
launch('Vite frontend', frontend, vite);
