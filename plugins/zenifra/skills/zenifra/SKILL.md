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
- Namespace help: `zenifra auth`, `zenifra profile`, `zenifra project`, `zenifra org`
- Login on the active profile: `zenifra auth login`
- Login on another profile: `zenifra auth login --profile staging`
- Save an org API key on the active profile: `zenifra auth api-key --key znf_sua_chave`
- Save an org API key on another profile: `zenifra auth api-key --profile prod --key znf_sua_chave`
- Clear auth from a profile: `zenifra auth logout [--profile <name>]`
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
- Get project info or URL: `zenifra project info --project <project-id>` or `zenifra project url --project <project-id>`
- Read runtime logs: `zenifra project logs --project <project-id> [--instance <instance-id>]`
- Read GitHub build logs: `zenifra builds logs --project <project-id> --build <build-id> [--follow]`
- Read CPU, memory, and network metrics: `zenifra project metrics --project <project-id> [--instance <instance-id>]`
- Read network analytics: `zenifra project network --project <project-id> --view summary`
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
- If an old `session.json` exists and `profiles.json` does not, the CLI migrates it automatically into the `default` profile.
- The active profile is the local source of truth for `apiBaseUrl`, description, and saved credential.
- Profile credentials can be either an org API key or a user access token; `selectedOrganizationId` only applies to user-login profiles.
- `ZENIFRA_API_KEY` overrides the active profile credential for the current command only.
- `ZENIFRA_API_URL` overrides the active profile API base for the current command only.
- The CLI sends `Authorization: Bearer <token>` and `x-organization-id` only when needed.
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
