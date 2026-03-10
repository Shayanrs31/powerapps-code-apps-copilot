---
applyTo: '**'
---

# Power Apps Code Apps — Workspace Instructions

This workspace contains **Power Apps Code Apps**: custom Single-Page Applications (React/Vite/TypeScript) hosted inside Power Platform with managed Entra auth, 1 500+ connectors, and DLP enforcement.

## Architecture

| Layer | Role |
|---|---|
| Your SPA (React + Vite) | UI and business logic; calls generated typed services |
| `@microsoft/power-apps` client library | Connector APIs; manages models/services; drives `power.config.json` |
| Power Apps host | Manages Entra SSO, app loading, error surfacing |

Generated files — **do not edit manually**:
- `power.config.json` — metadata used by CLI and SDK
- `src/generated/services/*.ts` — auto-generated connector service files
- `src/generated/models/*.ts` — auto-generated connector model files

## CLI Commands

```bash
# Preferred: npm CLI (SDK v1.0.4+)
# ⚠️ Run ALL npx power-apps commands from INSIDE the project folder (e.g. my-tasks/)
# The `power-apps` binary lives in node_modules/.bin — npx won't find it from a parent directory
npx power-apps init --displayName "My App" --environmentId <envId>
npm run dev                  # local dev server
npm run build && npx power-apps push   # publish

# PAC CLI (legacy, still needed for auth/env selection)
pac auth create
pac env select --environment <environmentId>
pac code init --displayname "My App"
pac code push

# Data sources
pac code add-data-source -a "shared_office365users" -c <connectionId>
pac code add-data-source -a dataverse -t <table-logical-name>
pac code delete-data-source -a <apiName> -ds <dataSourceName>

# Discovery
pac code list-datasets -a <apiId> -c <connectionId>
pac code list-tables -a <apiId> -c <connectionId> -d <datasetName>
```

## Key Conventions

- Use **connection references** (not raw connection IDs) for ALM-safe deployments
- Re-generate data sources by deleting and re-adding if schema changes
- Local dev in Chrome/Edge (post Dec 2025): grant "local network access" when prompted
- End-users need a **Power Apps Premium license**
- **Before suggesting PAC CLI installation**, always check if it's already present:
  - Common install path: `%LOCALAPPDATA%\Microsoft\PowerAppsCLI\pac.cmd` (VS Code extension / MSI)
  - Test with `pac help` (NOT `pac --version` — that flag is invalid)
  - The npm `pac` package is broken on Node 18+ — do not suggest `npm install -g pac`

## Microsoft Learn MCP Tools

The Microsoft Learn MCP server is available in this workspace. Always use it for Power Platform/Power Apps research:

```
microsoft_docs_search("Power Apps code apps <topic>")
microsoft_docs_fetch("https://learn.microsoft.com/en-us/power-apps/developer/code-apps/<page>")
microsoft_code_sample_search("Power Apps code apps <topic>")
```

Key doc pages:
- Overview: `power-apps/developer/code-apps/overview`
- Architecture: `power-apps/developer/code-apps/architecture`
- Connect to data: `power-apps/developer/code-apps/how-to/connect-to-data`
- Connect to Dataverse: `power-apps/developer/code-apps/how-to/connect-to-dataverse`
- npm quickstart: `power-apps/developer/code-apps/how-to/npm-quickstart`

## Limitations (do not suggest workarounds that violate these)

- No Power Platform Git integration
- Not supported in Power Apps mobile or Power Apps for Windows
- No SharePoint Forms integration
- No Storage SAS IP restriction support
