# Power Apps Code Apps — Workspace

This workspace contains **Power Apps Code Apps**: React + Vite + TypeScript SPAs deployed inside Power Platform with managed Entra auth, 1,500+ connectors, and DLP enforcement.

## Architecture

| Layer | Role |
|---|---|
| Your SPA (React + Vite + TypeScript) | UI and business logic |
| `@microsoft/power-apps` client library | Connector APIs; drives `power.config.json` |
| Power Apps host | Manages Entra SSO, app loading, error surfacing |

## Critical Rules

- **Never edit** `power.config.json`, `src/generated/services/*.ts`, `src/generated/models/*.ts` — regenerate via CLI instead
- **No root export** from `@microsoft/power-apps` — use subpaths: `/app`, `/data`, `/telemetry`
- **Static service methods** — there is no `ServiceFactory`; call `XxxService.getAll(...)` directly
- **All connector calls go through hooks** — never call services directly inside components
- **Connection references** over raw connection IDs for any env-portable code
- **Run `npx power-apps` from inside the project folder** — it is a local package, not global

## CLI Quick Reference

```bash
# Auth & env
pac auth create && pac env select --environment <envId>

# Scaffold
npx power-apps init --displayName "My App" --environmentId <envId>

# Dev / build / push (from inside project folder)
npm run dev
npm run build && npx power-apps push

# Data sources
pac code add-data-source -a "shared_<api>" -c <connectionId>
pac code add-data-source -a dataverse -t <table-logical-name>
pac code delete-data-source -a <apiName> -ds <dataSourceName>
```

## Agents Available

| Agent | Invoke with | Use for |
|---|---|---|
| PA Plan | `@pa-plan` | Architecture, data flow, connector strategy, ALM design |
| PA Code | `@pa-code` | Components, hooks, data sources, CLI operations |
| PA Review | `@pa-review` | Code quality, security, DLP compliance, best practices |
| PA Document | `@pa-document` | READMEs, connector guides, deployment runbooks |

## Skill Available

`/power-apps-code-apps` — load full patterns, SDK usage, and reference for Power Apps Code Apps.

## MCP Tools

The `microsoft-learn` MCP server is configured in `.vscode/mcp.json`:

```
microsoft_docs_search("Power Apps code apps <topic>")
microsoft_docs_fetch("https://learn.microsoft.com/en-us/power-apps/developer/code-apps/<page>")
microsoft_code_sample_search("Power Apps code apps <topic>")
```

Key pages: `overview`, `architecture`, `how-to/npm-quickstart`, `how-to/connect-to-data`, `how-to/connect-to-dataverse`, `system-limits-configuration`

## Platform Limitations

- No Power Platform Git integration (use standard Git + PAC CLI solution export/import)
- Web only — not supported in Power Apps mobile or Power Apps for Windows
- No SharePoint Forms integration
- Local dev (post Dec 2025): Chrome/Edge will prompt for "local network access" — grant it
