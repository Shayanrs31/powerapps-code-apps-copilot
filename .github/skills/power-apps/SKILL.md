# Power Apps Code Apps — Developer Reference

Quick-reference for all patterns, commands, and decisions when building Power Apps Code Apps in this workspace.

---

## Scaffolding a New App

```bash
# From this CodeApps directory
npx degit github:microsoft/PowerAppsCodeApps/templates/vite <app-name>
cd <app-name>
npm install
npx power-apps init --displayName "<Display Name>" --environmentId <envId>
# or interactive:
npx power-apps init
```

---

## Daily Dev Commands

```bash
npm run dev              # start local dev server
npm run build            # production build
npx power-apps push      # publish to environment
```

---

## Adding Data Sources

| Connector Type | Command |
|---|---|
| Non-tabular (O365, Teams, etc.) | `pac code add-data-source -a "shared_<api>" -c <connectionId>` |
| Tabular (SQL, SharePoint) | `pac code add-data-source -a "shared_<api>" -c <connectionId> -t <tableId> -d <datasetName>` |
| Dataverse table | `pac code add-data-source -a dataverse -t <table-logical-name>` |
| Via connection reference | `pac code add-data-source -a <apiName> -cr <crLogicalName> -s <solutionId>` |

```bash
# Discover what's available
pac connection list                                          # find connectionId
pac code list-datasets -a <apiId> -c <connectionId>         # list datasets
pac code list-tables -a <apiId> -c <connectionId> -d <ds>   # list tables

# Remove a data source
pac code delete-data-source -a <apiName> -ds <dataSourceName>
```

---

## Using Generated Services

```typescript
import { ServiceFactory } from '@microsoft/power-apps';
import { Office365UsersService } from './services/Office365UsersService';

// In a hook
const service = ServiceFactory.getService(Office365UsersService);
const me = await service.MyProfile_V2();
```

**Rule**: Never call connector endpoints directly. Always use generated services.

**Rule**: If the connector schema changes, regenerate:
```bash
pac code delete-data-source -a <apiName> -ds <dataSourceName>
pac code add-data-source -a <apiName> -c <connectionId>
```

---

## Project Structure

```
<app-name>/
├── power.config.json        ← DO NOT EDIT — SDK metadata
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── services/            ← DO NOT EDIT — auto-generated connector services
│   │   └── MyConnectorService.ts
│   ├── models/              ← DO NOT EDIT — auto-generated connector models
│   │   └── MyConnectorModel.ts
│   ├── hooks/               ← your custom hooks wrapping services
│   ├── components/          ← your React components
│   └── pages/               ← your page-level components
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## Authentication

**Do nothing.** Power Apps host manages Entra SSO automatically. The user is already authenticated when the app loads. Never implement custom auth, never call MSAL directly, never store tokens.

---

## ALM — Connection References

For apps deployed across environments (Dev → Test → Prod):

```bash
# List connection references in a solution
pac code list-connection-references -env <environmentURL> -s <solutionID>

# Add data source via connection reference (ALM-safe)
pac code add-data-source -a <apiName> -cr <connectionReferenceLogicalName> -s <solutionID>
```

**Why**: Raw connection IDs are user-specific and environment-specific. Connection references resolve automatically per environment when importing the solution.

---

## Environment Admin Setup

Required once per environment (by admin in Power Platform Admin Center):

1. Environments → select environment → Settings → Product → Features
2. Toggle **Enable code apps** → ON
3. Save

---

## PAC CLI Auth

```bash
pac auth create                              # interactive browser login
pac auth list                                # list profiles
pac env select --environment <environmentId> # pick environment
pac env who                                  # verify current env
```

---

## Local Dev — Browser Note (post Dec 2025)

Chrome and Edge block public-origin → localhost requests by default. When the browser shows a "local network access" permission prompt after opening the Local Play URL, **grant it**. This is expected behaviour, not an error.

---

## Known Platform Limitations

| Not supported | Notes |
|---|---|
| Power Platform Git integration | Use standard Git via PAC CLI solution export/import |
| Power Apps mobile app | Web only |
| Power Apps for Windows | Web only |
| SharePoint Forms integration | N/A |
| Storage SAS IP restriction | N/A |
| Power BI data integration | Embed via Power Apps Visual in Power BI instead |

---

## Microsoft Learn MCP Tools (for AI agents)

Available in this workspace for real-time doc lookup:

```
microsoft_docs_search("Power Apps code apps <topic>")
microsoft_docs_fetch("https://learn.microsoft.com/en-us/power-apps/developer/code-apps/<page>")
microsoft_code_sample_search("Power Apps code apps <topic>")
```

Key pages:
- `overview` — what code apps are
- `architecture` — runtime architecture deep-dive
- `how-to/create-an-app-from-scratch` — PAC CLI quickstart
- `how-to/npm-quickstart` — npm CLI quickstart (preferred)
- `how-to/connect-to-data` — all connector types
- `how-to/connect-to-dataverse` — Dataverse-specific
- `system-limits-configuration` — rate limits and quotas

---

## Custom VS Code Agents (this workspace)

| Agent | Use for |
|---|---|
| **PA Plan** | Architecture, data flow, connector strategy, ALM design |
| **PA Code** | Implementing components, hooks, data sources, CLI operations |
| **PA Review** | Code quality, security, DLP compliance, best practices audit |
| **PA Document** | READMEs, connector guides, deployment runbooks |

Activate from the VS Code Copilot chat input → click the agent picker → select agent.

---

## Useful Links

- [Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- [Architecture](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture)
- [npm Quickstart](https://learn.microsoft.com/power-apps/developer/code-apps/how-to/npm-quickstart)
- [Connect to data](https://learn.microsoft.com/power-apps/developer/code-apps/how-to/connect-to-data)
- [Connect to Dataverse](https://learn.microsoft.com/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- [GitHub samples & templates](https://github.com/microsoft/PowerAppsCodeApps)
- [npm package `@microsoft/power-apps`](https://www.npmjs.com/package/@microsoft/power-apps)
