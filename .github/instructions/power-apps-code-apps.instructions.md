---
applyTo: '**/*.ts,**/*.tsx,**/*.json'
---

# Power Apps Code Apps — Code Instructions

## Generated Files — NEVER Edit Manually

These files are fully controlled by the SDK/CLI. Editing them breaks regeneration:

```
power.config.json          ← CLI metadata, do not touch
src/services/*.ts          ← auto-generated connector services
src/models/*.ts            ← auto-generated connector models
```

To update: delete the data source and re-add it via CLI.

## Using Connector Services

Always use the generated typed service via `ServiceFactory`:

```typescript
import { ServiceFactory } from '@microsoft/power-apps';
import { MyConnectorService } from '../services/MyConnectorService';

// In a custom hook
export function useMyData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = ServiceFactory.getService(MyConnectorService);
    service.GetItems()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
```

## Dataverse Typed Pattern

```typescript
import { ServiceFactory } from '@microsoft/power-apps';
import { DataverseService } from '../services/DataverseService';
import { AccountModel } from '../models/AccountModel';

const service = ServiceFactory.getService(DataverseService);
const accounts: AccountModel[] = await service.GetAccounts();
```

## TypeScript Requirements

- No `any` for connector responses — use generated model types
- Handle optional fields from Dataverse (nullable columns)
- Use `unknown` + type guards for error handling

## Hook Pattern (required for all connector calls)

```typescript
// src/hooks/useAccounts.ts
export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ServiceFactory.getService(DataverseService)
      .GetAccounts()
      .then(setAccounts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { accounts, loading, error };
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
