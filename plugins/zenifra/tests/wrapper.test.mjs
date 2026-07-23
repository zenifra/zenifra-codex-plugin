import { mkdtemp, mkdir, copyFile, writeFile, chmod, rm, readFile } from 'node:fs/promises';
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

test('documents current billing and autoscaling flows without the removed command', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const removedBillingCommand = ['led', 'ger'].join('');

  assert.match(skill, /project billing usage/);
  assert.match(skill, /--from <ISO>/);
  assert.match(skill, /--to <ISO>/);
  assert.match(skill, /--page <n>/);
  assert.match(skill, /--limit <n>/);
  assert.match(skill, /config\.autoscaling/);
  assert.match(skill, /config\.instances/);
  assert.match(skill, /max_instances/);
  assert.match(skill, /between 1 and 100/);
  assert.match(skill, /free plans and non-HTTP projects/);
  assert.match(skill, /--json/);
  assert.match(skill, /auth logout \[--profile <name>] --revoke/);
  assert.match(skill, /local-only by default/);
  assert.match(skill, /API keys must be revoked through the organization/);
  assert.match(skill, /ZENIFRA_HTTP_TIMEOUT_MS/);
  assert.match(readme, /http-autoscaling-project\.json/);
  assert.match(readme, /project billing usage/);
  assert.match(readme, /auth logout --revoke/);
  assert.match(readme, /profiles\.json/);
  assert.doesNotMatch(`${skill}\n${readme}`, new RegExp(removedBillingCommand, 'i'));
});
