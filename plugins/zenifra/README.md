# Zenifra Codex Plugin

Plugin da Zenifra para usar projetos, deploys, builds, logs, metricas, envs e organizacoes pelo Codex.

Este plugin e uma camada fina sobre o CLI publico da Zenifra. Instale o CLI antes de instalar o plugin:

```bash
npm install -g @zenifra/cli
```

## Instalar no Codex

```bash
codex plugin marketplace add https://github.com/zenifra/zenifra-codex-plugin --ref main
codex plugin add zenifra@zenifra
```

Depois de instalar, abra uma nova sessao do Codex para que a skill `zenifra` seja carregada.

## Desenvolvimento local

Dentro do monorepo da Zenifra, voce pode usar o CLI local:

```bash
cd ../../../../zenifra-cli
npm link
```

Depois disso, use:

```bash
zenifra auth login
zenifra help project logs
zenifra auth login --code 123456
zenifra orgs
zenifra org set
zenifra projects --type http --page 1 --limit 15
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
zenifra builds logs --project <project-id> --build <build-id>
zenifra builds logs --project <project-id> --build <build-id> --follow
zenifra deploy --project <project-id> --branch main
zenifra deploy watch --project <project-id> --build <build-id>
```

Use `zenifra project logs` para logs da aplicacao rodando e `zenifra builds logs` para logs do build GitHub. `zenifra deploy` retorna um `build_id`, e `zenifra deploy watch` usa esse `build_id` para acompanhar status e logs incrementais em tempo real ate o fim do build.

Se voce rodar comandos incompletos como `zenifra deploy`, `zenifra deploy watch` ou `zenifra builds` sem os argumentos obrigatorios, a CLI agora mostra a ajuda especifica do comando em vez de apenas um erro curto.

## Configuracao

- API padrao: `https://api.zenifra.com/v1`
- Override: `ZENIFRA_API_URL=https://api-stg.zenifra.com/v1`
- Sessao local: `~/.config/zenifra-cli/session.json`
- Override de sessao: `ZENIFRA_CONFIG_DIR=/path/custom`

Todos os comandos de listagem aceitam `--json`. `zenifra projects` e paginado; use `--page <n>` e `--limit <n>` para navegar sem carregar todos os projetos.
Cada comando aceita `--help` e tambem pode ser consultado com `zenifra help <command>`.
Valores de envs sao mascarados por padrao; use `--show-values` somente quando o valor completo for necessario.

## Uso pelo Codex

O plugin contem a skill `zenifra`, que orienta o Codex a usar:

```bash
zenifra <command>
```

ou, como fallback dentro deste workspace:

```bash
node ../../../../zenifra-cli/bin/zenifra.mjs <command>
```

## Marketplace do Codex

Este repositorio ja inclui `.agents/plugins/marketplace.json`, entao pode ser usado diretamente como marketplace Git pelo `codex plugin marketplace add`.
