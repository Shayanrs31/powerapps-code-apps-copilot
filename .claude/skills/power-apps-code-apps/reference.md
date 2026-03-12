# Power Apps Code Apps — Reference

## Contents

- [PAC CLI Auth & Environment](#pac-cli-auth--environment)
- [Scaffolding Commands](#scaffolding-commands)
- [Data Sources](#data-sources)
- [Project Structure](#project-structure)
- [Dataverse Generated Model Quirks](#dataverse-generated-model-quirks)
- [Authentication](#authentication)
- [ALM — Connection References](#alm--connection-references)
- [Environment Admin Setup](#environment-admin-setup)
- [Known Limitations](#known-limitations)
- [Key Doc Pages](#key-doc-pages)

---

## PAC CLI Auth & Environment

```bash
pac auth create                              # interactive browser login
pac auth list                                # list auth profiles
pac env select --environment <environmentId> # pick environment
pac env who                                  # verify current env
```

Check PAC CLI is present before suggesting install:

```bash
pac help 2>&1 | head -3        # works if on PATH
# Common install location (VS Code extension / MSI):
# %LOCALAPPDATA%\Microsoft\PowerAppsCLI\pac.cmd
```

Note: `pac --version` is not a valid flag. Use `pac help`.

---

## Scaffolding Commands

```bash
# Preferred: npm CLI (SDK v1.0.4+)
# ⚠️ Run ALL npx power-apps commands from INSIDE the project folder
npx power-apps init --displayName "My App" --environmentId <envId>
# or interactive:
npx power-apps init

# PAC CLI (legacy, still needed for auth/env)
pac code init --displayname "My App"
pac code push
```

---

## Data Sources

### Add Data Sources

| Connector Type | Command |
|---|---|
| Non-tabular (O365, Teams, etc.) | `pac code add-data-source -a "shared_<api>" -c <connectionId>` |
| Tabular (SQL, SharePoint) | `pac code add-data-source -a "shared_<api>" -c <connectionId> -t <tableId> -d <datasetName>` |
| Dataverse table | `pac code add-data-source -a dataverse -t <table-logical-name>` |
| Via connection reference | `pac code add-data-source -a <apiName> -cr <crLogicalName> -s <solutionId>` |

### Discover Available Connections

```bash
pac connection list                                          # find connectionId
pac code list-datasets -a <apiId> -c <connectionId>         # list datasets
pac code list-tables -a <apiId> -c <connectionId> -d <ds>   # list tables
```

### Remove a Data Source

```bash
pac code delete-data-source -a <apiName> -ds <dataSourceName>
```

---

## Project Structure

```
<app-name>/
├── power.config.json             ← DO NOT EDIT — SDK metadata
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── generated/                ← DO NOT EDIT — auto-generated
│   │   ├── services/             ← connector service files
│   │   ├── models/               ← connector model files
│   │   └── models/CommonModels.ts
│   ├── hooks/                    ← your custom hooks wrapping services
│   ├── components/               ← your React components
│   └── pages/                    ← your page-level components
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## Dataverse Generated Model Quirks

- **Numeric columns** (`percentcomplete`, etc.) are typed as `string` — use `Number()` when mapping to numeric form state
- **State/status/priority fields** are enum literal types (e.g. `Tasksstatecode = 0 | 1 | 2`), not plain `number`
- **Lookup name fields** (e.g. `owneridname`) are typed directly on the interface — do not cast to `Record<string, unknown>`
- **`@odata.bind` write pattern**: generated field name is PascalCase (e.g. `"RegardingObjectId@odata.bind"`); cast to `Partial<Omit<XxxBase, 'id'>>` when passing to `update()`
- **`IGetAllOptions`** is NOT exported from the SDK package — it lives in `src/generated/models/CommonModels.ts`
- Use `satisfies (keyof Model)[]` for `select` arrays — prevents invalid Dataverse field names that compile but fail at runtime with HTTP 400

---

## Authentication

Power Apps host manages Entra SSO automatically. The user is already authenticated when the app loads.

- Never implement custom auth
- Never call MSAL directly
- Never store tokens

---

## ALM — Connection References

For apps deployed across environments (Dev → Test → Prod):

```bash
# List connection references in a solution
pac code list-connection-references -env <environmentURL> -s <solutionID>

# Add data source via connection reference (ALM-safe)
pac code add-data-source -a <apiName> -cr <connectionReferenceLogicalName> -s <solutionID>
```

Raw connection IDs are user-specific and environment-specific. Connection references resolve automatically per environment when importing the solution. Never hardcode connection IDs like `shared_office365users-<guid>` in TypeScript.

---

## Environment Admin Setup

Required once per environment (admin in Power Platform Admin Center):

1. Environments → select environment → Settings → Product → Features
2. Toggle **Enable code apps** → ON
3. Save

---

## Known Limitations

| Not supported | Notes |
|---|---|
| Power Platform Git integration | Use standard Git via PAC CLI solution export/import |
| Power Apps mobile app | Web only |
| Power Apps for Windows | Web only |
| SharePoint Forms integration | N/A |
| Storage SAS IP restriction | N/A |
| Power BI data integration | Embed via Power Apps Visual in Power BI instead |

Local dev note: Post Dec 2025, Chrome/Edge block public-origin → localhost. When prompted for "local network access", grant it. Do not use workarounds that bypass this security prompt.

---

## Key Doc Pages

- Overview: `https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview`
- Architecture: `https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture`
- npm Quickstart: `https://learn.microsoft.com/power-apps/developer/code-apps/how-to/npm-quickstart`
- Connect to data: `https://learn.microsoft.com/power-apps/developer/code-apps/how-to/connect-to-data`
- Connect to Dataverse: `https://learn.microsoft.com/power-apps/developer/code-apps/how-to/connect-to-dataverse`
- System limits: `https://learn.microsoft.com/power-apps/developer/code-apps/system-limits-configuration`
- GitHub samples: `https://github.com/microsoft/PowerAppsCodeApps`
