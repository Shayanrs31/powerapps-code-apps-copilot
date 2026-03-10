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

## How Copilot works in this repo

All customization lives under `.github/` and is versioned with the repo.

### How it flows during an edit session

```
You write a prompt in Copilot
        ↓
.github/copilot-instructions.md         — always loaded (workspace context)
        ↓
.github/instructions/power-apps-code-apps.instructions.md
                                         — loaded when editing .ts / .tsx / .json
        ↓
hooks.json PreToolUse                   — blocks edits to generated files before they happen
        ↓
Copilot makes the edit
        ↓
hooks.json PostToolUse                  — Prettier formats the file automatically
```

### Workspace instructions

- [.github/copilot-instructions.md](.github/copilot-instructions.md) applies to all files and sets workspace-wide guidance and CLI conventions.
- [.github/instructions/power-apps-code-apps.instructions.md](.github/instructions/power-apps-code-apps.instructions.md) applies to TypeScript, TSX, and JSON files and defines strict rules like not editing generated files.

### Custom agents

Invoke with `@PA Plan`, `@PA Code`, etc. in Copilot Chat.

| Agent | File | When to use |
| --- | --- | --- |
| PA Plan | [.github/agents/plan.agent.md](.github/agents/plan.agent.md) | Before writing code — architecture, component tree, connector strategy, ALM design. Has a handoff button → PA Code. |
| PA Code | [.github/agents/code.agent.md](.github/agents/code.agent.md) | Implementing features and connector integrations |
| PA Review | [.github/agents/review.agent.md](.github/agents/review.agent.md) | Code review against an 8-point checklist (security, DLP, generated files, ALM, TypeScript) |
| PA Document | [.github/agents/document.agent.md](.github/agents/document.agent.md) | READMEs, runbooks, and connector documentation |
| PA Test | [.github/agents/test.agent.md](.github/agents/test.agent.md) | Smoke-test that agents are loaded and responding |

### Hooks

Hooks are defined in [.github/hooks/hooks.json](.github/hooks/hooks.json) and run automatically during Copilot tool use.

- **format-on-save**: PostToolUse hook that runs Prettier on `.ts` / `.tsx` / `.json` edits.
- **prevent-generated-file-edits**: PreToolUse hook that blocks edits to `power.config.json`, `src/services/*.ts`, and `src/models/*.ts`.

If Prettier is not available, run:
```bash
npm install
```

### Skills

The Power Apps skill is a quick reference for patterns and commands:
- [.github/skills/power-apps/SKILL.md](.github/skills/power-apps/SKILL.md)

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
