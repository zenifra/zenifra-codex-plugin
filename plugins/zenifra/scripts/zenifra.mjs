#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRootCliCandidates = [
  resolve(currentDir, '../../../zenifra-cli/bin/zenifra.mjs'),
  resolve(currentDir, '../../../../../zenifra-cli/bin/zenifra.mjs'),
];
const explicitCli = process.env.ZENIFRA_CLI_BIN;
const args = process.argv.slice(2);
const repoRootCli = repoRootCliCandidates.find((candidate) => existsSync(candidate));

const command = explicitCli || (repoRootCli ? process.execPath : 'zenifra');
const commandArgs = explicitCli
  ? [explicitCli, ...args]
  : repoRootCli
    ? [repoRootCli, ...args]
    : args;

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (error) => {
  if (error.code === 'ENOENT') {
    console.error('Zenifra CLI not found. Install it with `npm link` from zenifra-cli or set ZENIFRA_CLI_BIN.');
    process.exit(127);
    return;
  }

  console.error(error.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
