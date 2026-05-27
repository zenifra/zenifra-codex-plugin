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
zenifra help project logs
zenifra auth login --code 123456
zenifra orgs
zenifra org set
zenifra projects --type http
zenifra project info --project <project-id>
zenifra project url --project <project-id>
zenifra project logs --project <project-id>
zenifra project metrics --project <project-id>
zenifra project network --project <project-id> --view summary
zenifra project image set --project <project-id> --image <image>
zenifra project envs --project <project-id>
zenifra project env add --project <project-id> --name <name> --value <value>
zenifra project env update --project <project-id> --name <name> --value <value>
zenifra project env remove --project <project-id> --name <name>
zenifra project instances --project <project-id>
zenifra project instances set --project <project-id> --count <n>
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
Cada comando aceita `--help` e tambem pode ser consultado com `zenifra help <command>`.
Valores de envs sao mascarados por padrao; use `--show-values` somente quando o valor completo for necessario.

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
