# Power Apps Code App Setup

## Overview

A ready-to-clone developer workspace for building Power Apps Code Apps. Includes Copilot custom agents for planning, coding, reviewing, and documenting, plus automated hooks that block edits to generated files and auto-format on save.

### Architecture

| Layer | Role |
| --- | --- |
| Your SPA (React + Vite) | UI and business logic; calls generated typed services |
| `@microsoft/power-apps` client library | Connector APIs; manages models/services; drives `power.config.json` |
| Power Apps host | Manages Entra SSO, app loading, error surfacing |

Generated files — **do not edit manually**:

| File | Why |
| --- | --- |
| `power.config.json` | CLI metadata — edited only by `npx power-apps` / `pac` |
| `src/services/*.ts` | Auto-generated typed connector service files |
| `src/models/*.ts` | Auto-generated connector model types |

To update generated files: delete the data source and re-add it via CLI.

---

## AI Tools

This workspace is configured for both **GitHub Copilot** and **Claude Code**. See [AI-SETUP.md](AI-SETUP.md) for the full explanation of how each tool works, what files each reads, and how to test the setup.

### GitHub Copilot

Workspace instructions load automatically:
- [.github/copilot-instructions.md](.github/copilot-instructions.md) — always-on workspace context (architecture, CLI conventions, key rules)
- [.github/instructions/power-apps-code-apps.instructions.md](.github/instructions/power-apps-code-apps.instructions.md) — code rules loaded when editing `.ts`, `.tsx`, and `.json` files

### Claude Code

Agents, skills, and hooks live in `.claude/` and are versioned with the repo.

| Agent | When to use |
| --- | --- |
| **PA Plan** | Before writing code — architecture, component tree, connector strategy, ALM design |
| **PA Code** | Implementing features, hooks, and connector integrations |
| **PA Review** | Code review against an 8-point checklist (security, DLP, generated files, ALM, TypeScript) |
| **PA Document** | READMEs, runbooks, and connector documentation |

Invoke agents naturally in Claude chat — e.g. _"plan the connector strategy for a leave-request app"_ — or ask explicitly — _"use the PA Review agent to check my hooks folder"_.

**Skill:** type `/power-apps-code-apps` in Claude chat to load patterns, SDK usage, and CLI commands.

**Hooks** (`.claude/settings.json`):
- **format-on-save** — runs Prettier automatically after any `.ts` / `.tsx` / `.json` edit
- **block generated files** — prevents edits to `power.config.json` and `src/generated/**`

If Prettier is not available, run `npm install` inside your project folder.

## Prerequisites
- Power Platform environment with code apps enabled: https://learn.microsoft.com/power-apps/developer/code-apps/overview#enable-code-apps-on-a-power-platform-environment
- Power Apps Premium license for end users: https://www.microsoft.com/power-platform/products/power-apps/pricing
- Node.js LTS and npm: https://nodejs.org/
- Git: https://git-scm.com/
- Power Platform CLI (pac): https://learn.microsoft.com/power-platform/developer/cli/introduction
- Power Apps code apps npm CLI (via `npx power-apps`): https://learn.microsoft.com/power-apps/developer/code-apps/how-to/npm-quickstart

## Local setup
1. Install dependencies:
```bash
npm install
```

2. Authenticate and select an environment:
```bash
pac auth create
pac env select --environment <environmentId>
```

3. Initialize (new app only):
```bash
npx power-apps init --displayName "App Name" --environmentId <environmentId>
```

4. Run locally:
```bash
npm run dev
```
Open the URL labeled Local Play using the same browser profile as your Power Platform tenant. Chrome and Edge may prompt for local network access when the app connects to localhost.

5. Build and publish:
```bash
npm run build
npx power-apps push
```

## Data sources
Add data sources after the app is initialized.

- Use connection references for ALM-safe deployments:
```bash
pac code add-data-source -a <apiName> -cr <connectionReferenceLogicalName> -s <solutionID>
```

- Add with a connection id (dev only):
```bash
pac code add-data-source -a <apiName> -c <connectionId>
```

- Add a tabular data source:
```bash
pac code add-data-source -a <apiName> -c <connectionId> -t <tableId> -d <datasetName>
```

- Discover datasets and tables:
```bash
pac code list-datasets -a <apiId> -c <connectionId>
pac code list-tables -a <apiId> -c <connectionId> -d <datasetName>
```

- Delete a data source (use this to refresh schema):
```bash
pac code delete-data-source -a <apiName> -ds <dataSourceName>
```

## CI/CD notes for Azure DevOps
- Keep secrets in secure pipeline variables or a key vault.
- Use a non-interactive authentication method before build and push (service principal or managed identity) with either the Power Platform CLI or Power Platform build tasks.
- Typical pipeline steps:
  1. Install Node.js LTS
  2. Run `npm ci`
  3. Run `npm run build`
  4. Run `npx power-apps push`

## References
- Npm CLI quickstart: https://learn.microsoft.com/power-apps/developer/code-apps/how-to/npm-quickstart
- Connect to data: https://learn.microsoft.com/power-apps/developer/code-apps/how-to/connect-to-data
- Overview: https://learn.microsoft.com/power-apps/developer/code-apps/overview
