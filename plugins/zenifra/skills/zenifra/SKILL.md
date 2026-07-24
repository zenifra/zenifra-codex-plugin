---
name: zenifra
description: Use when the user wants to manage Zenifra projects, profiles, organizations, deployments, builds, or authentication from Codex.
---

# Zenifra

Use the Zenifra CLI for product operations.

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
- Namespace help: `zenifra auth`, `zenifra profile`, `zenifra project`, `zenifra org`, `zenifra object-storage`
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
- List Object Storage plans and buckets: `zenifra object-storage plans`, `zenifra object-storage buckets list`
- Create or remove a bucket: `zenifra object-storage buckets create --name <name> --tier <capacity|performance> --quota <GiB>`, `zenifra object-storage buckets delete --bucket <bucket-id>`
- List and revoke Object Storage credentials: `zenifra object-storage keys list`, `zenifra object-storage keys revoke --key <key-id>`
- Create a restricted Object Storage credential: `zenifra object-storage keys create --name <name> --bucket <bucket-id> --permissions bucket:list,object:read,object:write [--prefixes uploads/,assets/]`
- Read Object Storage usage: `zenifra object-storage usage`
- Read or manage private policy/CORS: `zenifra object-storage policy --bucket <bucket-id> [--config <json|@file>]`, `zenifra object-storage cors --bucket <bucket-id> [--config <json|@file>]`

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
- Object Storage data transfer stays in AWS CLI or S3-compatible SDKs. The Zenifra CLI manages only buckets, access, policy, CORS and usage.
- `zenifra object-storage policy|cors --config` receives the policy or CORS document itself; the CLI wraps it in the management API contract. Prefix restrictions are comma-separated with `--prefixes` when creating a credential.
- An Object Storage `secret_access_key` is revealed only at creation. Never repeat it in a later response, store it in workspace files, logs, or tool arguments. Tell the user to save it immediately in their approved secret manager.
- Object Storage buckets are private. Do not propose public policies; use limited, temporary presigned URLs for external uploads or downloads.
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
