# Deployment Notes

## Standalone Output Follow-Up

`next.config.ts` enables `output: 'standalone'`, so production builds now create `.next/standalone/`.

The current Windows NSSM service still runs `npm run start`, which calls `next start -p 3001`. That remains the active startup path for this pass.

To actually use the standalone bundle in a later proxy/deploy rework, update the service to run the generated standalone server:

```powershell
node .next\standalone\server.js
```

When switching to that startup path, make sure `.next/static` and `public/` are copied alongside the standalone output so static assets are served correctly.

Health checks can use:

```text
http://localhost:3001/api/health
```
