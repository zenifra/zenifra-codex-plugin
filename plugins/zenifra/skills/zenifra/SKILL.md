---
name: zenifra
description: Use when the user wants to manage Zenifra projects, organizations, deployments, builds, or authentication from Codex.
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
- Login: `zenifra auth login`
- Select organization: `zenifra org set`
- List projects: `zenifra projects --type http`
- Create a project: `zenifra projects create --name <name> --plan free --payment-mode hourly --config @project.json`
- Get project info or URL: `zenifra project info --project <project-id>` or `zenifra project url --project <project-id>`
- Read runtime logs: `zenifra project logs --project <project-id> [--instance <instance-id>]`
- Read CPU, memory, and network metrics: `zenifra project metrics --project <project-id> [--instance <instance-id>]`
- Read network analytics: `zenifra project network --project <project-id> --view summary`
- Update a project image: `zenifra project image set --project <project-id> --image <image>`
- Manage envs: `zenifra project envs --project <project-id>`, `zenifra project env add/update/remove --project <project-id> --name <name>`
- Manage instances: `zenifra project instances --project <project-id>` and `zenifra project instances set --project <project-id> --count <n>`
- Trigger GitHub deploy: `zenifra deploy --project <project-id> --branch main`
- Watch build: `zenifra deploy watch --project <project-id> --build <build-id>`
- List builds: `zenifra builds --project <project-id>`
- List deployments/builds: `zenifra deployments --project <project-id>`

## Behavior

- The CLI stores session data under `~/.config/zenifra-cli/session.json`.
- It sends `Authorization: Bearer <token>` and `x-organization-id` when needed.
- It defaults to `https://api.zenifra.com/v1`; set `ZENIFRA_API_URL` to override.
- Prefer `--json` when another tool or script will consume the result.
- Use `zenifra help <command>` when you need command-specific flags, usage examples, and output examples.
- Env values are masked by default, including with `--json`; use `--show-values` only when the full value is required.
