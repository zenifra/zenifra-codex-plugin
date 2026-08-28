---
name: zenifra
description: Use when the user wants to manage Zenifra projects, profiles, organizations, deployments, builds, or authentication from Codex.
---

# Zenifra

Use the Zenifra CLI for product operations.

## Public repository boundary

This skill lives in a public repository and is limited to the public `zenifra-cli` and documented product concepts. Never commit or paste passwords, TOTP codes, API keys, access tokens, connection strings, customer data, private project identifiers, or unredacted command output. Never mention or expose private architecture, internal infrastructure, internal service names, operational runbooks, or development-tool details. Do not call private or undocumented API endpoints to compensate for a missing CLI command.

## Safe operation rules

- Treat read-only commands and mutating commands differently. Listing, plan catalogs, project info, URLs, logs, metrics, capabilities, builds, deployments, billing usage, Valkey status, and profile inspection are read-oriented; create, deploy, image, exposure, environment, instance, autoscaling, credential rotation, logout with `--revoke`, and profile changes have side effects.
- Before a mutation, verify the exact profile, API base, organization, project, branch or commit, and intended values. Production mutations require explicit user scope; never infer them from a name such as `prod`.
- Use `--idempotency-key` for project creation and Valkey credential rotation when a retry may happen. Retry only with the same key and only after inspecting the previous response; do not mask authentication, authorization, validation, setup, or cleanup failures with generic retries.
- After every external mutation, read back the final state. A successful request or an accepted asynchronous operation is not proof that the desired state was reached.
- When a requested capability is not exposed by the CLI, say so instead of inventing a command or using an undocumented endpoint. The CLI currently does not expose a project deletion command.

## Authentication safety

- Prefer the interactive prompt for passwords, TOTP codes, and API keys. Never place passwords, TOTP codes, API keys, tokens, or connection strings in committed examples, shell history, logs, or assistant responses.
- `auth login` may require email, password, and a verification challenge. `--code` is available for automation only when the caller has already handled secret redaction and secure input.
- `auth api-key` validates the `znf_` prefix locally but does not prove that the key is active; verify the first authorized read operation without printing the key.
- Keep user-login tokens and organization API keys conceptually separate. API keys are organization-bound and do not need `org set`; user-login profiles may need `org set`.
- For tests, previews, or temporary validation, set `ZENIFRA_CONFIG_DIR` to a temporary directory so the user's normal profile store is not changed. Remove the temporary directory after verification.

## Valkey-specific guidance

- For Valkey projects, query `zenifra project metrics capabilities --project <project-id>` before requesting a snapshot when access is unknown.
- `availability: unavailable` with `valkey: null` is a valid result while the first snapshot is not ready. Do not convert `null` or `unavailable` into zero and do not claim that a metric was collected.
- Native Valkey `memory.used_bytes` is the memory currently used by Valkey; `memory.limit_bytes` is Valkey's configured limit and may differ from the instance capacity.
- The legacy top-level `memory` value in the metrics response is current instance/container usage in bytes, not provisioned capacity. Do not label it as capacity unless the API exposes a dedicated capacity field.
- Valkey profiles are `key_value`, `cache`, and `queue`. Cache adds hits, misses, and hit ratio; Key Value adds key inventory; Queue must not receive an invented queue-depth value.
- `valkey credentials rotate` returns an asynchronous operation. Use `--wait` or the returned operation identifier with `valkey credentials status`, and save a newly returned connection value only in a secure local destination.

## Output and asynchronous operations

- Human output is for direct inspection. `--json` preserves the public response for ordinary commands; do not parse table columns as an API contract.
- `deploy watch --json` emits one JSON object per line while streaming build events, not one final JSON document. `builds logs --follow` similarly streams incremental output.
- Project creation, deployment, and credential rotation may be asynchronous. Capture the returned identifier, poll with the supported command, and report the terminal state or the actual blocker.
- Environment values and credentials are masked by default. Never use `--show-values` unless the user explicitly requires it, and never include the revealed value in a report.

## Error handling and pagination

- Distinguish authentication failures, authorization failures, validation failures, plan restrictions, rate limits, network timeouts, and asynchronous operation failures. Report the actual category and next supported action.
- A `401` means the credential or session needs attention; a `403` means the authenticated principal lacks permission; a metrics plan restriction must not be treated as a transient network error; a `429` may include a retry interval.
- Projects, builds, deployments, autoscaling events, and billing usage are paginated. Use the returned pagination fields and do not claim that one page is the complete result.
- For deploys where the exact revision matters, pass `--commit-sha` and preserve the supplied identifier literally. Verify the resulting build's commit before claiming that the intended revision was published.

## Command

Prefer the public CLI command when it is installed:

```bash
zenifra <command>
```

Inside this workspace, use the local CLI project as fallback:

```bash
node zenifra-cli/bin/zenifra.mjs <command>
```

## Common Workflows

- Command-specific help: `zenifra help <command>` or `zenifra <command> --help`
- Namespace help: `zenifra auth`, `zenifra profile`, `zenifra project`, `zenifra org`
- Login on the active profile: `zenifra auth login`
- Login on another profile: `zenifra auth login --profile staging`
- Save an org API key on the active profile: `zenifra auth api-key --key znf_sua_chave`
- Save an org API key on another profile: `zenifra auth api-key --profile prod --key znf_sua_chave`
- Clear only local auth from a profile: `zenifra auth logout [--profile <name>]`
- Revoke user login sessions and then clear local auth: `zenifra auth logout [--profile <name>] --revoke`
- List profiles: `zenifra profile list`
- Show a profile: `zenifra profile show [name]`
- Add a profile: `zenifra profile add --name staging --description Homologacao --api-base https://api-stg.zenifra.com/v1 --mode api-key --key znf_sua_chave`
- Switch the active profile: `zenifra profile use staging`
- Edit a profile: `zenifra profile edit staging --description "Homologacao interna"`
- Remove a non-active profile: `zenifra profile remove staging`
- Select organization for a user-login profile: `zenifra org set`
- Compare public plan prices: `zenifra plans`, `zenifra plans --type http`, `zenifra plans --type storage --json`
- List projects: `zenifra projects --type http --page 1 --limit 15`
- Create a project from flags: `zenifra create project --name <name> --plan free --payment-mode hourly --config @project.json`
- Run the interactive project wizard: `zenifra create project`
- Read hourly consumption and compute/storage costs: `zenifra project billing usage --project <project-id> [--from <ISO>] [--to <ISO>] [--page <n>] [--limit <n>] [--json]`
- Read Valkey status and masked connection data: `zenifra valkey status --project <project-id>` and `zenifra valkey connection --project <project-id>`
- Rotate a Valkey credential and follow the operation: `zenifra valkey credentials rotate --project <project-id> [--wait]` or `zenifra valkey credentials status --project <project-id> --operation <operation-id>`
- Get project info or URL: `zenifra project info --project <project-id>` or `zenifra project url --project <project-id>`
- Read runtime logs: `zenifra project logs --project <project-id> [--instance <instance-id>]`
- Read GitHub build logs: `zenifra builds logs --project <project-id> --build <build-id> [--follow]`
- Read CPU, memory, and network metrics: `zenifra project metrics --project <project-id> [--instance <instance-id>]`
- Read network analytics: `zenifra project network --project <project-id> --view summary`
- Manage HTTP autoscaling: `zenifra project autoscaling --project <project-id>`, `zenifra project autoscaling set --project <project-id> --min <n> --max <n>`, and `zenifra project autoscaling disable --project <project-id>`
- Read HTTP autoscaling history: `zenifra project autoscaling events --project <project-id> [--direction <scale_up|scale_down>] [--page <n>] [--limit <n>]`
- Update a project image: `zenifra project image set --project <project-id> --image <image>`
- Manage envs: `zenifra project envs --project <project-id>`, `zenifra project env add/update/remove --project <project-id> --name <name>`
- Manage instances: `zenifra project instances --project <project-id>` and `zenifra project instances set --project <project-id> --count <n>`
- Trigger GitHub deploy and receive a `build_id`: `zenifra deploy --project <project-id> --branch main`
- Watch that build with live logs: `zenifra deploy watch --project <project-id> --build <build-id>`
- List builds: `zenifra builds --project <project-id>`
- List deployments/builds: `zenifra deployments --project <project-id>`

## Create Examples

- HTTP via OCI: `zenifra create project --name app-http-oci --plan free --payment-mode hourly --config @examples/http-project.json`
- HTTP via GitHub: `zenifra create project --name app-http-github --plan basic --payment-mode hourly --config @examples/http-github-project.json`
- PostgreSQL: `zenifra create project --name app-postgres --plan db-basic --payment-mode monthly --config @examples/postgresql-project.json`
- MariaDB: `zenifra create project --name app-mariadb --plan db-basic --payment-mode monthly --config @examples/mariadb-project.json`
- HTTP with autoscaling: `zenifra create project --name app-http-autoscaling --plan premium --payment-mode hourly --config @examples/http-autoscaling-project.json`
- When the user prefers prompts instead of JSON, run `zenifra create project` and use the wizard.
- Treat these examples as starting points, not as permission to assume production values.

## Before Creating Projects

- Project creation can generate cost for the customer. Do not guess values that affect billing or infrastructure shape.
- Before suggesting a plan or comparing cost, prefer running `zenifra plans` so the user sees the current HTTP, database, and storage catalogs.
- Before running `zenifra create project`, confirm the minimum required inputs with the user.
- Always confirm:
  - `type_project`
  - `plan`
  - `payment_mode`
  - storage strategy and capacity
  - initial envs
- For HTTP projects, also confirm the deploy strategy:
  - OCI or image URL flow
  - GitHub flow
  - exposure: `public` creates route/domain, `private` keeps the app without internet exposure
- For HTTP via OCI, confirm at least:
  - image URL
  - whether the image is public or needs authentication
  - exposure
  - port
  - instances
  - storage
  - envs
- If HTTP autoscaling is requested during creation, also confirm:
  - `config.instances` as the initial minimum instance count
  - `config.autoscaling.max_instances` as a value greater than or equal to `config.instances`
  - `config.autoscaling.target_cpu_utilization_percent` and `config.autoscaling.target_memory_utilization_percent` when provided, each between 1 and 100
  - that the selected paid HTTP plan permits autoscaling
- For HTTP via GitHub, confirm at least:
  - repository owner
  - repository name
  - branch
  - runtime
  - runtime version
  - start/build commands when applicable
  - exposure
  - port
  - instances
  - storage
  - envs
- For PostgreSQL, confirm at least:
  - plan
  - version
  - instances/replicas
  - storage
- For MariaDB, confirm at least:
  - plan
  - version
  - storage
- If the agent is not confident about plan choice, deploy strategy, storage, envs, or any other create-time field that can affect cost or production behavior, ask the user before creating the project.
- If the user has not explicitly confirmed those inputs, prefer asking over inferring.

## Behavior

- The CLI stores profile data under `~/.config/zenifra-cli/profiles.json`.
- If an old `session.json` exists and `profiles.json` does not, the CLI migrates it automatically into the `default` profile and removes the legacy file.
- The active profile is the local source of truth for `apiBaseUrl`, description, and saved credential.
- Profile credentials can be either an org API key or a user access token; `selectedOrganizationId` only applies to user-login profiles.
- `ZENIFRA_API_KEY` overrides the active profile credential for the current command only.
- `ZENIFRA_API_URL` overrides the active profile API base for the current command only.
- `ZENIFRA_HTTP_TIMEOUT_MS` configures the per-request HTTP timeout in milliseconds; the default is 30000.
- The CLI sends `Authorization: Bearer <token>` and `x-organization-id` only when needed.
- `zenifra auth logout` is local-only by default. Use `--revoke` only with a user-login profile when the user wants to invalidate their server sessions; API keys must be revoked through the organization.
- `zenifra plans` is a public read-only command and works without authentication.
- `zenifra projects` is paginated; default to `--page 1 --limit 15` and request additional pages only when needed.
- Prefer `--json` when another tool or script will consume the result.
- `zenifra deploy` returns a `build_id`; use it with `zenifra deploy watch --project <project-id> --build <build-id>` to follow the build until completion.
- `zenifra project logs` is for runtime logs. `zenifra builds logs` is for GitHub build logs.
- `zenifra deploy watch` now streams incremental build logs until the build reaches a terminal status.
- When a required argument is missing in commands like `zenifra deploy`, `zenifra deploy watch`, `zenifra builds`, or common `project` subcommands, the CLI now prints the command-specific help instead of only a terse validation error.
- `zenifra projects create` was removed; if you see it in old notes, use `zenifra create project` instead.
- Running `zenifra create project` without flags opens the interactive wizard.
- `create project` does not assume silent defaults for `plan` or `payment_mode`.
- Non-interactive HTTP project configs must include `exposure`; use `private` when the user wants automation, workers, internal routines, or anything that should not receive a public domain.
- `examples/http-project.json` is the HTTP OCI example, `examples/http-github-project.json` is the HTTP GitHub example, and the database examples match the current CLI contract.
- Human success output for `create project` is a `Campo | Valor` table, and the displayed domain is normalized to a full `https://...` URL.
- Env values are masked by default, including with `--json`; use `--show-values` only when the full value is required.
- For unanswered product questions, consult `https://docs.zenifra.com/llms.txt`.
- `config.autoscaling` is accepted only for paid HTTP projects. It must use `enabled: true`; free plans and non-HTTP projects must be rejected before the API call.
- The interactive wizard offers autoscaling only when the selected plan reports `permissions.allow_autoscaling === "true"`.
- `zenifra project billing usage` is read-only and returns hourly compute and storage consumption; use `--from`, `--to`, `--page`, and `--limit` for bounded queries and `--json` for automation.
