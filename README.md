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
