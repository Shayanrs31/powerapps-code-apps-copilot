---
applyTo: '**/*.ts,**/*.tsx,**/*.json'
---

# Power Apps Code Apps — Code Instructions

## Generated Files — NEVER Edit Manually

These files are fully controlled by the SDK/CLI. Editing them breaks regeneration:

```
power.config.json                  ← CLI metadata, do not touch
src/generated/services/*.ts        ← auto-generated connector services
src/generated/models/*.ts          ← auto-generated connector models
src/generated/models/CommonModels.ts  ← shared IGetAllOptions / IGetOptions
```

To update: delete the data source and re-add it via CLI.

## SDK Imports

The `@microsoft/power-apps` package has **no root export** — only subpaths:

```typescript
// User context — returns Promise<IContext>, must be awaited
import { getContext } from '@microsoft/power-apps/app';
const context = await getContext();
const objectId = context.user.objectId;       // Entra/Azure AD object ID
const upn      = context.user.userPrincipalName;
const name     = context.user.fullName;

// IOperationResult type (for reference only — services return this)
// { success: boolean, data: T, error?: Error, skipToken?: string, count?: number }
import type { IOperationResult } from '@microsoft/power-apps/data';
```

## Using Connector Services

Generated services expose **static methods** — there is no `ServiceFactory`:

```typescript
import { TasksService } from '../generated/services/TasksService';
import type { Tasks } from '../generated/models/TasksModel';

// In a custom hook
export function useTasks() {
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void TasksService.getAll({ filter: "statecode eq 0", top: 500 })
      .then(r => setTasks((r.data as Tasks[]) ?? []))
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return { tasks, loading, error };
}
```

## Dataverse Typed Pattern

```typescript
import { AccountsService } from '../generated/services/AccountsService';
import type { Accounts } from '../generated/models/AccountsModel';

const result = await AccountsService.getAll({ filter: "contains(name,'Contoso')", top: 20 });
const accounts = (result.data as Accounts[]) ?? [];
```

## Dataverse Generated Model Quirks

Be aware of these patterns in generated types — they differ from raw Dataverse schema:

- **Numeric columns** (`percentcomplete`, `importsequencenumber`, etc.) are typed as `string` in generated models — use `Number()` when mapping to numeric form state
- **State/status/priority fields** are `keyof` enum literal types (e.g. `Tasksstatecode = 0 | 1 | 2`), not plain `number`; comparisons like `task.statecode === 0` are valid
- **Lookup name fields** (e.g. `regardingobjectidname`, `owneridname`) are typed directly on the extended interface — do NOT cast to `Record<string, unknown>` to access them
- **`@odata.bind` write pattern**: the generated field name is PascalCase (e.g. `"RegardingObjectId@odata.bind"`); cast the record to `Partial<Omit<XxxBase, 'id'>>` when passing to `update()`
- **IOperationResult.data** is already typed — unnecessary to double-cast; if the type is wrong, the generated model is the source of truth
- **`IGetAllOptions`** is NOT exported from the SDK package — it lives in `src/generated/models/CommonModels.ts` (auto-generated)

## TypeScript Requirements

- No `any` for connector responses — use generated model types
- Handle optional fields from Dataverse (nullable columns)
- Use `unknown` + type guards for error handling

## Hook Pattern (required for all connector calls)

```typescript
// src/hooks/useAccounts.ts
import { useCallback, useState } from 'react';
import { AccountsService } from '../generated/services/AccountsService';
import type { Accounts } from '../generated/models/AccountsModel';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const searchAccounts = useCallback(async (term: string) => {
    if (!term.trim()) { setAccounts([]); return; }
    const safe = term.replace(/'/g, "''");  // prevent OData injection
    setLoadingAccounts(true);
    try {
      const r = await AccountsService.getAll({ filter: `contains(name,'${safe}')`, top: 20 });
      setAccounts((r.data as Accounts[]) ?? []);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  return { accounts, loadingAccounts, searchAccounts };
}
```

## Security Rules

- No credentials or secrets in any source file
- No `.env` files committed to git (add to `.gitignore`)
- No custom fetch/axios calls to connector endpoints — always use generated services
- No `console.log` of user data or connector responses in production code paths

## ALM / Connection References

When the app needs to be deployed across environments, use connection references:

```bash
# Check available connection references in your solution
pac code list-connection-references -env <environmentURL> -s <solutionID>

# Add data source via connection reference (ALM-safe)
pac code add-data-source -a <apiName> -cr <connectionReferenceLogicalName> -s <solutionID>
```

Never hardcode connection IDs like `shared_office365users-<guid>` in your TypeScript code.

## Error Boundaries

Wrap page-level components with an error boundary. Power Apps host handles auth errors, so only catch business logic errors:

```tsx
// App.tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Router>
    <Routes>...</Routes>
  </Router>
</ErrorBoundary>
```

## Vite Config Note

Do not change the Vite base URL or port configuration — it affects how the Power Apps host loads your app during local development.
