#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRootCli = resolve(currentDir, '../../../zenifra-cli/bin/zenifra.mjs');

const child = spawn(process.execPath, [repoRootCli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
