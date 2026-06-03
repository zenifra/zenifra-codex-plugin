# Zenifra Codex Plugin Marketplace

Marketplace publico do plugin da Zenifra para Codex.

## Instalar

Instale o CLI publico da Zenifra:

```bash
npm install -g @zenifra/cli
```

Registre este marketplace no Codex e instale o plugin:

```bash
codex plugin marketplace add https://github.com/zenifra/zenifra-codex-plugin --ref main
codex plugin add zenifra@zenifra
```

Depois de instalar, abra uma nova sessao do Codex para carregar a skill `zenifra`.

## Desenvolvimento

O plugin fica em `plugins/zenifra`. Para validar localmente:

```bash
cd plugins/zenifra
npm test
npm run check
```

O plugin orienta o Codex a usar os fluxos de build GitHub do CLI, incluindo:

- `zenifra builds --project <project-id>`
- `zenifra builds logs --project <project-id> --build <build-id> [--follow]`
- `zenifra deploy --project <project-id> --branch main`
- `zenifra deploy watch --project <project-id> --build <build-id>`

Fluxo recomendado:

- `zenifra deploy` dispara o build GitHub e retorna o `build_id`
- `zenifra deploy watch` usa esse `build_id` para acompanhar status e logs incrementais ate o estado terminal
- `zenifra builds` lista o historico; `zenifra builds logs` reabre ou segue os logs de um build especifico

Se voce rodar comandos incompletos como `zenifra deploy`, `zenifra deploy watch` ou `zenifra builds` sem os argumentos obrigatorios, a CLI agora mostra a ajuda especifica do comando.
