# Zenifra Codex Plugin

Plugin local para usar a Zenifra pelo Codex.

Este plugin usa o CLI publico da Zenifra, mantido separadamente em `../../zenifra-cli`.

## Instalar o CLI para uso local

```bash
cd ../../zenifra-cli
npm link
```

Depois disso, use:

```bash
zenifra auth login
zenifra auth login --code 123456
zenifra orgs
zenifra org set
zenifra projects --type http
zenifra builds --project <project-id>
zenifra deploy --project <project-id> --branch main
zenifra deploy watch --project <project-id> --build <build-id>
```

## Configuracao

- API padrao: `https://api.zenifra.com/v1`
- Override: `ZENIFRA_API_URL=https://api-stg.zenifra.com/v1`
- Sessao local: `~/.config/zenifra-cli/session.json`
- Override de sessao: `ZENIFRA_CONFIG_DIR=/path/custom`

Todos os comandos de listagem aceitam `--json`.

## Uso pelo Codex

O plugin contem a skill `zenifra`, que orienta o Codex a usar:

```bash
zenifra <command>
```

ou, como fallback dentro deste workspace:

```bash
node zenifra-cli/bin/zenifra.mjs <command>
```

## Marketplace do Codex

O manifesto do plugin esta em `.codex-plugin/plugin.json`. Se quiser registrar este plugin em um marketplace local do Codex, adicione uma entrada apontando para `./plugins/zenifra`.
