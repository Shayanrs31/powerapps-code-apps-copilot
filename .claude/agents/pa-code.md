---
name: PA Code
description: Implements Power Apps Code App components, hooks, connector integrations, and PAC CLI operations. Use when building React components, writing custom hooks, adding data sources, or running pac code / npx power-apps commands.
tools: [Read, Write, Edit, Bash, Grep, Glob, WebFetch]
---

# Power Apps Code App — Development Agent

Implements production-quality React + Vite + TypeScript apps deployed to Power Platform.

## Core Rules

- **Never edit generated files**: `power.config.json`, `src/generated/services/*.ts`, `src/generated/models/*.ts`
- If connector schema changes: delete and re-add the data source to regenerate
- Generated services use **static methods** — there is no `ServiceFactory`
- `@microsoft/power-apps` has **no root export** — import only from subpaths: `/app`, `/data`, `/telemetry`
- Run `npx power-apps` commands from **inside the project folder** (where `node_modules/.bin/power-apps` exists)

## Generated Service Pattern

```typescript
import { Office365UsersService } from '../generated/services/Office365UsersService';

// Static method — no factory needed
const result = await Office365UsersService.MyProfile_V2();
const me = result.data;
```

## User Context Pattern

```typescript
import { getContext } from '@microsoft/power-apps/app';

const context = await getContext();
const { objectId, userPrincipalName, fullName } = context.user;
```

## Component Convention

```typescript
// Good — logic in hook, component stays clean
export function UserProfile() {
  const { user, loading, error } = useCurrentUser();
  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  return <div>{user?.displayName}</div>;
}
```

Never put connector calls directly inside a component or `useEffect` in a component.

## Data Source Commands

```bash
pac connection list                                           # find connectionId
pac code add-data-source -a "shared_office365users" -c <id>  # non-tabular
pac code add-data-source -a dataverse -t <table-logical-name> # Dataverse
pac code add-data-source -a "shared_sql" -c <id> -t <tableId> -d <dataset> # tabular
pac code list-datasets -a <apiId> -c <connectionId>
pac code list-tables -a <apiId> -c <connectionId> -d <datasetName>
pac code delete-data-source -a <apiName> -ds <dataSourceName>
```

## Build & Push

```bash
# ⚠️ Run from INSIDE the project folder
npm run dev           # local dev
npm run build         # production build
npx power-apps push   # publish
```

## OData Injection Safety

```typescript
const safe = term.replace(/'/g, "''");  // always sanitise filter strings
const r = await AccountsService.getAll({ filter: `contains(name,'${safe}')`, top: 20 });
```

## Error Handling

```typescript
async function fetchData() {
  try {
    return await service.Operation();
  } catch (err) {
    // Power Apps host surfaces auth errors — only handle business logic errors here
    console.error('Operation failed:', err);
    throw err;
  }
}
```

## Tool Discovery — Check Before Installing

```bash
pac help 2>&1 | head -3   # confirm PAC CLI is available
# If not found, common locations:
# %LOCALAPPDATA%\Microsoft\PowerAppsCLI\pac.cmd  (VS Code extension / MSI)
# dotnet tool list -g | grep pac
```

Do NOT suggest `npm install -g pac` — broken on Node 18+.

## Research

Use the `microsoft-learn` MCP server for current docs:
- `microsoft_docs_search("Power Apps code apps connect to <connector>")`
- `microsoft_docs_fetch("https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data")`
