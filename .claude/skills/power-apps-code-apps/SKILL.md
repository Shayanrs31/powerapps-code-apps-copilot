---
name: power-apps-code-apps
description: Provides patterns, commands, and conventions for building Power Apps Code Apps (React + Vite + TypeScript on Power Platform). Use when working with pac code commands, @microsoft/power-apps SDK, npx power-apps, Dataverse or connector data sources, or deploying React/Vite apps to Power Platform.
---

# Power Apps Code Apps

React + Vite + TypeScript SPAs deployed to Power Platform with managed Entra auth, 1,500+ connectors, and DLP enforcement.

## Architecture

| Layer | Role |
|---|---|
| Your SPA (React + Vite + TypeScript) | UI and business logic |
| `@microsoft/power-apps` client library | Connector APIs; drives `power.config.json` |
| Power Apps host | Manages Entra SSO, app loading, error surfacing |

## Generated Files — Never Edit Manually

```
power.config.json                     ← CLI metadata
src/generated/services/*.ts           ← auto-generated connector services
src/generated/models/*.ts             ← auto-generated connector models
src/generated/models/CommonModels.ts  ← shared IGetAllOptions / IGetOptions
```

To update: delete and re-add the data source via CLI.

## Quick Start

```bash
# Scaffold (run from parent folder)
npx degit github:microsoft/PowerAppsCodeApps/templates/vite <app-name>
cd <app-name>
npm install
npx power-apps init --displayName "My App" --environmentId <envId>

# Daily (run from INSIDE the project folder)
npm run dev               # local dev server
npm run build             # production build
npx power-apps push       # publish to environment
```

## SDK Imports

```typescript
// No root export — use subpaths only
import { getContext } from '@microsoft/power-apps/app';
import type { IOperationResult } from '@microsoft/power-apps/data';

const context = await getContext();
const { objectId, userPrincipalName, fullName } = context.user;
```

## Generated Service Pattern

Static methods — there is no `ServiceFactory`:

```typescript
import { TasksService } from '../generated/services/TasksService';
import type { Tasks } from '../generated/models/TasksModel';

const result = await TasksService.getAll({ filter: 'statecode eq 0', top: 500 });
const tasks = (result.data as Tasks[]) ?? [];
```

## Hook Pattern (required for all connector calls)

```typescript
export function useTasks() {
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void TasksService.getAll({ filter: 'statecode eq 0', top: 500 })
      .then(r => setTasks((r.data as Tasks[]) ?? []))
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return { tasks, loading, error };
}
```

## Key Conventions

- Use **connection references** (not raw connection IDs) for ALM-safe deployments
- Regenerate data sources by deleting and re-adding if schema changes
- Local dev Chrome/Edge (post Dec 2025): grant "local network access" when prompted
- End-users need a **Power Apps Premium license**
- Check for PAC CLI before suggesting install: `pac help` from `%LOCALAPPDATA%\Microsoft\PowerAppsCLI\pac.cmd`
- Do **not** suggest `npm install -g pac` — broken on Node 18+

## Microsoft Learn MCP Tools

The `microsoft-learn` MCP server is configured in `.vscode/mcp.json`. Use it for all Power Platform research:

```
microsoft_docs_search("Power Apps code apps <topic>")
microsoft_docs_fetch("https://learn.microsoft.com/en-us/power-apps/developer/code-apps/<page>")
microsoft_code_sample_search("Power Apps code apps <topic>")
```

---

For complete CLI command reference, data source patterns, ALM, Dataverse quirks, and known limitations, see [reference.md](reference.md).
