import { mkdtemp, mkdir, copyFile, writeFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('delegates to zenifra on PATH when the monorepo CLI path is unavailable', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'zenifra-plugin-wrapper-'));

  try {
    const scriptDir = join(tempRoot, 'cache', 'zenifra', '0.1.0', 'scripts');
    const binDir = join(tempRoot, 'bin');
    await mkdir(scriptDir, { recursive: true });
    await mkdir(binDir, { recursive: true });

    const wrapperPath = join(scriptDir, 'zenifra.mjs');
    await copyFile(new URL('../scripts/zenifra.mjs', import.meta.url), wrapperPath);

    const fakeCliPath = join(binDir, 'zenifra');
    await writeFile(fakeCliPath, '#!/usr/bin/env node\nconsole.log(JSON.stringify(process.argv.slice(2)));\n');
    await chmod(fakeCliPath, 0o755);

    const result = spawnSync(process.execPath, [wrapperPath, 'help', 'project', 'logs'], {
      cwd: tempRoot,
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ''}`,
      },
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /\["help","project","logs"\]/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
