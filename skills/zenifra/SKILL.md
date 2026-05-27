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

- Login: `zenifra auth login`
- Select organization: `zenifra org set`
- List projects: `zenifra projects --type http`
- Create a project: `zenifra projects create --name <name> --plan free --payment-mode hourly --config @project.json`
- Trigger GitHub deploy: `zenifra deploy --project <project-id> --branch main`
- Watch build: `zenifra deploy watch --project <project-id> --build <build-id>`
- List builds: `zenifra builds --project <project-id>`
- List deployments/builds: `zenifra deployments --project <project-id>`

## Behavior

- The CLI stores session data under `~/.config/zenifra-cli/session.json`.
- It sends `Authorization: Bearer <token>` and `x-organization-id` when needed.
- It defaults to `https://api.zenifra.com/v1`; set `ZENIFRA_API_URL` to override.
- Prefer `--json` when another tool or script will consume the result.
