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
zenifra auth login --oauth
zenifra help project logs
zenifra auth login --code 123456
zenifra auth logout --revoke
zenifra orgs
zenifra org set
zenifra projects --type http --page 1 --limit 15
zenifra plans --type job --json
zenifra create project --name app-http-autoscaling --plan premium --payment-mode hourly --config @examples/http-autoscaling-project.json
zenifra create project --name nightly-report --plan job-basic --payment-mode per_minute --config @job-config.json --idempotency-key <key>
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
zenifra project autoscaling --project <project-id>
zenifra project autoscaling set --project <project-id> --min 2 --max 8 --cpu 70 --memory 80
zenifra project autoscaling disable --project <project-id>
zenifra project autoscaling events --project <project-id> --direction scale_up --page 1 --limit 10
zenifra project billing usage --project <project-id> --from 2026-06-01T00:00:00Z --to 2026-06-02T00:00:00Z --page 1 --limit 20 --json
zenifra project runs --project <project-id> --page 1 --limit 20 --json
zenifra project runs logs --project <project-id> --run <run-id>
zenifra project runs cancel --project <project-id> --run <run-id>
zenifra project instances --project <project-id>
zenifra project instances set --project <project-id> --count <n>
zenifra builds --project <project-id>
zenifra builds logs --project <project-id> --build <build-id>
zenifra builds logs --project <project-id> --build <build-id> --follow
zenifra deploy --project <project-id> --branch main
zenifra deploy watch --project <project-id> --build <build-id>
```

Use `zenifra project logs` para logs da aplicacao rodando e `zenifra builds logs` para logs do build GitHub. `zenifra deploy` retorna um `build_id`, e `zenifra deploy watch` usa esse `build_id` para acompanhar status e logs incrementais em tempo real ate o fim do build.

Antes de uma mutacao, confirme o perfil, a API e a organizacao ativa. Em seguida, confirme o plano, o pagamento, o tipo de projeto e os campos aplicaveis. Depois da chamada, leia o estado final; para HTTP, confira tambem a URL e o build/deployment. Uma resposta aceita nao prova que o projeto esta pronto.

Jobs agendados usam planos `job-*`, cobranca `per_minute`, uma imagem OCI pronta e cron de cinco campos em UTC. Eles nao possuem URL publica, porta, exposicao ou instancias. Depois da criacao, confira as informacoes do projeto e acompanhe `project runs`; quando houver permissao, leia os logs da execucao com `project runs logs`. Cancele uma execucao ativa com `project runs cancel` somente dentro do escopo autorizado. O CLI atual nao oferece comando para alterar o cron; nao invente um comando ou endpoint para isso.

Para dominios personalizados, mantenha o dominio principal separado e aguarde DNS/TLS antes de concluir. Para MCP, use a URL completa terminada em `/mcp`, confira a descoberta do recurso e aceite `401` como o desafio esperado antes do OAuth.

Conexoes Valkey permanecem mascaradas. Quando uma rotacao concluida devolver uma conexao utilizavel, use `--connection-file <path>` em um destino privado; o arquivo preserva exatamente a string retornada pelo backend. Nao inclua a conexao em mensagens, logs ou commits.

Se voce rodar comandos incompletos como `zenifra deploy`, `zenifra deploy watch` ou `zenifra builds` sem os argumentos obrigatorios, a CLI agora mostra a ajuda especifica do comando em vez de apenas um erro curto.

Ao criar projetos HTTP via `zenifra create project`, configs nao interativas devem declarar `exposure`: `public` cria rota/dominio publico e `private` cria a aplicacao sem exposicao na internet.

Para criar um projeto HTTP pago com auto-scaling, use `config.instances` como o minimo inicial e `config.autoscaling.max_instances` como o limite maximo. Os alvos opcionais de CPU e memoria devem ficar entre 1 e 100, e `enabled` deve ser `true`. O recurso nao se aplica a planos `free` nem a projetos que nao sejam HTTP; o wizard so o oferece quando o plano permite auto-scaling.

Use `zenifra project billing usage` para consultar, sem alterar o projeto, o consumo horario consolidado de computacao e armazenamento. Os filtros `--from` e `--to` aceitam datas ISO; `--page` e `--limit` controlam a paginacao, com limite maximo de 50; `--json` preserva a resposta estruturada para automacao. Essa consulta financeira e distinta das operacoes de configuracao e historico de auto-scaling.

## Login OAuth e organizacoes

Enderecos em `example.test` sao ficticios; substitua pela API autorizada do seu ambiente.

O login OAuth e da conta do usuario, nao de uma organizacao especifica. Selecione a organizacao uma vez; a escolha fica salva no perfil:

```bash
zenifra auth login --oauth --profile staging --api-base https://api.example.test/v1
zenifra orgs
zenifra org set --org <organization-id>
zenifra projects
zenifra create project
```

Com apenas uma organizacao disponivel, o CLI a seleciona automaticamente quando necessario. Para usar outra apenas em um comando, passe `--org <organization-id>`. Um novo login OAuth limpa a selecao anterior desse perfil.

O consentimento exige leitura e permite aprovar escrita explicitamente. Use `--read-only` para solicitar somente leitura e `--no-browser` para abrir o endereco manualmente na mesma maquina. As permissoes atuais do usuario em cada organizacao continuam valendo; OAuth nao concede novos cargos ou acessos.

A renovacao da sessao e automatica. Cada perfil OAuth pertence a uma API: use perfis separados para ambientes diferentes. `ZENIFRA_API_KEY` continua tendo prioridade e o CLI avisa quando ela substitui a autenticacao OAuth. A confirmacao final de login aparece no terminal.

## Configuracao

- API padrao: `https://api.zenifra.com/v1`
- Override: `ZENIFRA_API_URL=https://api.example.test/v1`
- Timeout padrao de cada request HTTP: cinco minutos (`ZENIFRA_HTTP_TIMEOUT_MS=300000`)
- Perfis locais: `~/.config/zenifra-cli/profiles.json`
- Override de sessao: `ZENIFRA_CONFIG_DIR=/path/custom`

Todos os comandos de listagem aceitam `--json`. `zenifra projects` e paginado; use `--page <n>` e `--limit <n>` para navegar sem carregar todos os projetos.
Cada comando aceita `--help` e tambem pode ser consultado com `zenifra help <command>`.
Valores de envs sao mascarados por padrao; use `--show-values` somente quando o valor completo for necessario.
`zenifra auth logout` remove apenas a autenticacao local. Em um perfil OAuth, `--revoke` revoga somente aquela conexao. Em um perfil de login por senha, `--revoke` invalida as sessoes do usuario no servidor. API keys sao revogadas pela organizacao.

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
