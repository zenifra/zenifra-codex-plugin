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

test('passes Forgejo CLI arguments once to an explicit CLI executable', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'zenifra-plugin-explicit-cli-'));

  try {
    const scriptDir = join(tempRoot, 'cache', 'zenifra', '0.1.0', 'scripts');
    await mkdir(scriptDir, { recursive: true });

    const wrapperPath = join(scriptDir, 'zenifra.mjs');
    const fakeCliPath = join(tempRoot, 'zenifra-cli.mjs');
    await copyFile(new URL('../scripts/zenifra.mjs', import.meta.url), wrapperPath);
    await writeFile(fakeCliPath, '#!/usr/bin/env node\nconsole.log(JSON.stringify(process.argv.slice(2)));\n');
    await chmod(fakeCliPath, 0o755);

    const args = [
      'project', 'source', 'deploy-settings', 'set', '--project', 'project-opaque-id',
      '--mode', 'release', '--tag-pattern', 'v*', '--include-prereleases', 'false', '--json',
    ];
    const result = spawnSync(process.execPath, [wrapperPath, ...args], {
      cwd: tempRoot,
      env: {
        ...process.env,
        ZENIFRA_CLI_BIN: fakeCliPath,
      },
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout.trim()), args);
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

test('documents public safety boundaries and CLI automation semantics', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');

  assert.match(skill, /public repository/);
  assert.match(skill, /Never place passwords, TOTP codes, API keys, tokens/);
  assert.match(skill, /idempotency-key/);
  assert.match(skill, /one JSON object per line/);
  assert.match(skill, /project delete --project <project-id> --yes/);
  assert.match(skill, /without `--yes`, the CLI does not send a removal request/);
  assert.match(skill, /Do not call private or undocumented API endpoints/);
  assert.match(skill, /read back the final state/);
});

test('documents product-level mutation preflight and safe MCP/Valkey verification', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const publicDocs = `${skill}\n${readme}`;

  assert.match(publicDocs, /profile show --json/);
  assert.match(publicDocs, /orgs --json/);
  assert.match(publicDocs, /idempotency key/i);
  assert.match(publicDocs, /DNS\/TLS/);
  assert.match(publicDocs, /protected-resource/);
  assert.match(publicDocs, /401.*bearer challenge|bearer challenge.*401/i);
  assert.match(publicDocs, /--connection-file/);
  assert.match(publicDocs, /exact.*string.*backend/i);
  assert.match(publicDocs, /rediss:\/\//);
});

test('documents the Scheduled Jobs CLI boundary and billing-cycle contract in each public surface', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const sectionBetween = (content, startMarker, endMarker) => {
    const start = content.indexOf(startMarker);
    const end = content.indexOf(endMarker, start + startMarker.length);
    assert.notEqual(start, -1, `missing Scheduled Jobs section: ${startMarker}`);
    assert.notEqual(end, -1, `missing end marker for Scheduled Jobs section: ${endMarker}`);
    return content.slice(start, end);
  };
  const surfaces = [
    {
      name: 'README.md',
      content: sectionBetween(readme, 'Jobs agendados', 'Para dominios personalizados'),
      advancedApi: /nao use `config\.github`, `job\.command` ou `job\.args` no CLI V1.*API avancada documentada/i,
      unavailable: /capacidade estiver indisponivel.*nao invente uma rota.*403.*capacidade existe/i,
      envs: /config\.envs.*e obrigatorio.*envs: \[\].*sem omitir o campo/i,
      nonZero: /qualquer codigo nao zero, inclusive `1`/i,
    },
    {
      name: 'SKILL.md',
      content: sectionBetween(skill, '## Scheduled Jobs guidance', '## Output and asynchronous operations'),
      advancedApi: /does not support `config\.github`, `job\.command`, or `job\.args`; use the documented advanced API/i,
      unavailable: /capability is unavailable.*do not invent a route.*403.*capability exists/i,
      envs: /required `envs` array.*Use `envs: \[\]`.*do not omit `envs`/i,
      catalogUnavailable: /explicit `--type job` request must report that Scheduled Jobs is unavailable; the API response uses code `SCHEDULED_JOBS_UNAVAILABLE`/i,
      nonZero: /any non-zero code, including `1`/i,
    },
  ];

  for (const surface of surfaces) {
    const { name, content } = surface;
    assert.match(content, /zenifra plans --type job/, `${name}: missing Jobs catalog command`);
    assert.match(content, /project runs --project <project-id>/, `${name}: missing runs command`);
    assert.match(content, /project runs logs --project <project-id> --run <run-id>/, `${name}: missing logs command`);
    assert.match(content, /project runs cancel --project <project-id> --run <run-id>/, `${name}: missing cancel command`);
    assert.match(content, /config\.image/, `${name}: missing image-only CLI boundary`);
    assert.match(content, /config\.github/, `${name}: missing advanced API source boundary`);
    assert.match(content, /job\.command/, `${name}: missing advanced API command boundary`);
    assert.match(content, /job\.args/, `${name}: missing advanced API args boundary`);
    assert.match(content, surface.advancedApi, `${name}: advanced API boundary is not explicit`);
    assert.match(content, surface.envs, `${name}: config.envs must be an explicit array, including an empty array when unused`);
    assert.doesNotMatch(content, /optional `?envs`?/i, `${name}: config.envs must not be documented as optional`);
    assert.doesNotMatch(content, /default `?zenifra plans`?.{0,100}(?:can still show|pode(?:m)? continuar mostrando).{0,100}(?:other catalogs|outros cat[aá]logos)/i, `${name}: unsupported default catalog fallback claim`);
    if (name === 'SKILL.md') {
      assert.match(content, surface.catalogUnavailable, `${name}: explicit Jobs catalog unavailability contract is missing`);
      assert.doesNotMatch(content, /(?:CLI|user-visible output)[^\n]*(?:prints?|outputs?|reports?)\s+[`"]?SCHEDULED_JOBS_UNAVAILABLE/i, `${name}: API unavailability code must not be documented as literal CLI output`);
    }
    assert.match(content, /billed_minutes/, `${name}: missing billed minutes`);
    assert.match(content, /minimum of 1.*maximum of 60|m[ií]nimo de 1.*m[aá]ximo de 60/i, `${name}: missing minute bounds`);
    assert.match(content, /never rounded up|sem arredondamento para cima/i, `${name}: missing exact-amount rule`);
    assert.doesNotMatch(content, /HALF_UP|one decimal cent|uma casa decimal de centavo/i, `${name}: per-run rounding must not be documented`);
    assert.match(content, /image download|download da imagem/i, `${name}: missing container-start billing`);
    assert.match(content, /amount: 0\.05/, `${name}: missing sub-cent example`);
    assert.match(content, /stored amounts|persisted amounts|valores armazenados|valores persistidos/i, `${name}: missing persisted amounts`);
    assert.match(content, /current billing[- ]cycle|ciclo de cobranca|ciclo de cobrança/i, `${name}: missing cycle boundary`);
    assert.match(content, /GET \/v1\/project\/:id\/job-runs\/cost-summary/, `${name}: missing cost-summary API`);
    assert.match(content, /project\.billing\.read/, `${name}: missing billing permission`);
    assert.match(content, /project\.logs\.read/, `${name}: missing logs permission`);
    assert.match(content, /project\.metrics\.read/, `${name}: missing metrics permission`);
    assert.match(content, surface.unavailable, `${name}: missing unavailable-vs-403 distinction`);
    assert.match(content, /independent(?:ly)? of financial settlement|independentemente d[ae] liquidacao|independentemente d[ae] liquidação/i, `${name}: missing settlement-independent reset`);
    assert.match(content, /cycle where it started|ciclo em que comecou|ciclo em que começou/i, `${name}: missing start-time attribution`);
    assert.match(content, /up to four decimal places|ate quatro casas decimais|até quatro casas decimais/i, `${name}: missing display precision`);
    assert.match(content, /30 seconds|30 segundos/, `${name}: missing cancellation grace`);
    assert.match(content, /graceful shutdown|encerramento gracioso/i, `${name}: missing graceful cancellation`);
    assert.match(content, /forced cleanup|limpeza forcada|limpeza forçada/i, `${name}: missing forced cancellation`);
    assert.match(content, /exit code `?0|codigo de saida `?0|código de saída `?0/i, `${name}: missing success exit status`);
    assert.match(content, surface.nonZero, `${name}: missing non-zero failure status`);
    assert.match(content, /does not expose a cost-summary|nao oferece comando de cost-summary|não oferece comando de cost-summary/i, `${name}: invented CLI cost-summary boundary`);
    assert.doesNotMatch(content, /zenifra[^\n`]*(?:--github|--command|--args)\b/i, `${name}: invented unsupported CLI flag`);
    assert.doesNotMatch(content, /zenifra\s+(?:cost-summary|schedule-update)\b/i, `${name}: invented unsupported CLI command`);
  }
});

test('documents raw MCP tool names without repeating the server namespace', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const publicDocs = `${skill}\n${readme}`;

  assert.match(publicDocs, /get_context/);
  assert.match(publicDocs, /list_ai_keys/);
  assert.match(publicDocs, /get_project_logs/);
  assert.match(publicDocs, /get_build_logs/);
  assert.match(publicDocs, /get_project_network/);
  assert.match(publicDocs, /get_valkey_status/);
  assert.match(publicDocs, /list_project_instances.*before|liste instancias antes/i);
  assert.match(publicDocs, /server.*tool|tool.*server/i);
  assert.doesNotMatch(publicDocs, /zenifra_zenifra_/);
});

test('documents the current CLI identity, lifecycle, plan, and build-log contracts', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const manifest = JSON.parse(await readFile(new URL('../.codex-plugin/plugin.json', import.meta.url), 'utf8'));
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const publicDocs = `${skill}\n${readme}`;

  assert.match(publicDocs, /zenifra whoami --json/);
  assert.match(publicDocs, /zenifra project stop --project <project-id>/);
  assert.match(publicDocs, /zenifra project resume --project <project-id>/);
  assert.match(publicDocs, /zenifra project delete --project <project-id> --yes/);
  assert.match(publicDocs, /without `--yes`.*does not send|sem `--yes`.*nao envia/is);
  assert.match(publicDocs, /capabilities\.logs/);
  assert.match(publicDocs, /capabilities\.metrics/);
  assert.match(publicDocs, /capabilities\.healthcheck/);
  assert.match(publicDocs, /`event`.*`summary`|`summary`.*`event`/is);
  assert.match(publicDocs, /loopback.*same machine|mesma maquina.*loopback/is);
  assert.match(publicDocs, /initial deployment history|historico inicial de deployment/i);
  assert.doesNotMatch(publicDocs, /does not expose a project deletion command/i);
  assert.equal(manifest.version, '0.4.0');
  assert.equal(packageJson.version, manifest.version);
});

test('requires an informed, target-specific confirmation immediately before project deletion', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const manifest = JSON.parse(await readFile(new URL('../.codex-plugin/plugin.json', import.meta.url), 'utf8'));
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const publicDocs = `${skill}\n${readme}`;

  assert.match(publicDocs, /project name.*project ID.*project type/is);
  assert.match(publicDocs, /selected organization.*effective API base/is);
  assert.match(publicDocs, /immediately before.*delet/is);
  assert.match(publicDocs, /explicit.*unambiguous.*affirmative/is);
  assert.match(publicDocs, /earlier.*generic.*authorization.*does not count/is);
  assert.match(publicDocs, /only after.*confirmation.*--yes/is);
  assert.equal(manifest.version, '0.4.0');
  assert.equal(packageJson.version, manifest.version);
});

test('documents GitHub deployment triggers and the release prerelease opt-in', async () => {
  const skill = await readFile(new URL('../skills/zenifra/SKILL.md', import.meta.url), 'utf8');
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const publicDocs = `${skill}\n${readme}`;

  assert.match(publicDocs, /zenifra project github --project <project-id>/);
  assert.match(publicDocs, /deploy-settings set.*--mode <manual\|branch\|tag\|release>/);
  assert.match(publicDocs, /--tag-pattern <pattern>/);
  assert.match(publicDocs, /--include-prereleases <true\|false>/);
  assert.match(publicDocs, /prereleases are excluded by default|pre-releases are excluded by default/i);
  assert.match(publicDocs, /only when the user explicitly asks to deploy prereleases|requires an explicit user request/i);
  assert.match(skill, /initial build from the selected branch/i);
  assert.match(skill, /when a tag is created.*when a release is published/is);
  assert.match(skill, /matches the tag name.*exact name.*`\*` and `\?` wildcards.*not a regular expression.*release title/is);
  assert.match(skill, /without asking for redundant confirmation.*clarify only missing or ambiguous inputs/is);
  assert.match(publicDocs, /0\.4\.0/);
  assert.match(publicDocs, /installing the plugin does not install or update the CLI/i);
  assert.match(publicDocs, /read the settings again to verify|leia.*para conferir o modo efetivo/i);
});
