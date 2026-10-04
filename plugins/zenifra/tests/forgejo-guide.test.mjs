import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('links the Zenifra skill to the Forgejo workflow and complete HTTP config', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');
  const guideUrl = new URL('../skills/zenifra/references/forgejo.md', import.meta.url);
  const guide = await readFile(guideUrl, 'utf8');
  const config = JSON.parse(await readFile(new URL('../examples/http-forgejo-project.json', import.meta.url), 'utf8'));
  const manifest = JSON.parse(await readFile(new URL('../.codex-plugin/plugin.json', import.meta.url), 'utf8'));
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

  assert.match(skill, /references\/forgejo\.md/);
  const exampleLink = guide.match(/\]\(([^)]+http-forgejo-project\.json)\)/)?.[1];
  assert.ok(exampleLink);
  assert.equal(
    new URL(exampleLink, guideUrl).href,
    new URL('../examples/http-forgejo-project.json', import.meta.url).href,
  );
  assert.equal(manifest.version, '0.3.0');
  assert.equal(packageJson.version, manifest.version);
  assert.match(manifest.interface.longDescription, /Forgejo/);

  assert.deepEqual(Object.keys(config).sort(), [
    'build', 'envs', 'exposure', 'instances', 'network_access', 'port', 'source', 'storage', 'type_project',
  ]);
  assert.equal(config.type_project, 'http');
  assert.ok(['public', 'private'].includes(config.exposure));
  assert.equal(typeof config.source.connection_id, 'string');
  assert.equal(typeof config.source.repository_id, 'string');
  assert.equal(typeof config.source.branch, 'string');
  assert.equal(config.source.auto_deploy, true);
  assert.equal(config.source.version_deploy, undefined);
  assert.equal(typeof config.build.runtime, 'string');
  assert.equal(typeof config.build.version, 'string');
  assert.ok(Number.isInteger(config.port) && config.port > 0);
  assert.ok(Number.isInteger(config.instances) && config.instances > 0);
  assert.equal(typeof config.storage.persistent, 'boolean');
  assert.ok(Number.isInteger(config.storage.capacity));
  assert.ok(Array.isArray(config.envs));
  assert.ok(Array.isArray(config.network_access.ingress_white_list));
  assert.ok(Array.isArray(config.network_access.ingress_black_list));
  assert.doesNotMatch(JSON.stringify(config), /(?:personal.access.token|forgejo.token|api.key)/i);
});
