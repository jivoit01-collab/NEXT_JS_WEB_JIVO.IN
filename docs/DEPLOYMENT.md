# Deployment — Production & Testing

Two fully isolated environments deploy from one repository, driven by one
reusable PowerShell script.

| | Production | Testing |
|---|---|---|
| Branch | `main` | `testing` |
| Folder | `...\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_LIVE` | `...\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_TEST` |
| Service | `jivo-web-live` | `jivo-web-test` |
| Domain | jivo.in | abc.jivo.in |
| Port | 3001 | 3002 |
| Workflow | `.github/workflows/deploy-production.yml` | `.github/workflows/deploy-testing.yml` |
| Logs | `Logs\Production` | `Logs\Testing` |
| Backups | `Backups\Production` | `Backups\Testing` |

## Directory structure

```
C:\LiveProjects\JIVO_WEBSITE\
├── NEXT_JS_WEB_JIVO.IN_LIVE\     # main branch, jivo-web-live, port 3001
│   └── .env.production           # LIVE database + https://jivo.in
├── NEXT_JS_WEB_JIVO.IN_TEST\     # testing branch, jivo-web-test, port 3002
│   └── .env.production           # TEST database + https://abc.jivo.in
├── Logs\
│   ├── Production\               # jivo-deploy-production-<timestamp>.log
│   └── Testing\                  # jivo-deploy-testing-<timestamp>.log
├── Backups\
│   ├── Production\               # last-known-good.txt + deploy-history.txt
│   └── Testing\
└── Deploy\                       # script copies pulled by the workflows
```

## How a deploy runs

Push to `main` → `deploy-production.yml` → SSH → `cd _LIVE` → extract the script
from `origin/main` into `Deploy\deploy-production.ps1` → run it with
`-Environment Production`. Testing is the same with its own branch, folder and
file. The script is fetched from the branch being deployed, so each environment
runs its own version of the deployment logic.

Steps performed (unchanged from the previous single-environment pipeline):

1. Administrator validation
2. Deployment-folder + git-working-copy validation
3. `package-lock.json` auto-cleanup, then dirty working tree guard
4. `git fetch origin <branch>`, branch guard, `git pull --ff-only`
5. `npm install`
6. `npm run build` (**before** the restart)
7. `npm run db:push` and `npm run db:seed` — non-fatal
8. NSSM restart (falls back to `net stop`/`net start`)
9. HTTP health check against `/api/health`, 12 attempts, 5s apart
10. On any failure: rollback to the previous commit, reinstall, rebuild,
    restart, re-check. Everything transcript-logged; old logs pruned to 30.

## Isolation guarantees

- Each workflow triggers on **one** branch only and passes only its own
  environment's parameters.
- Separate concurrency groups: a production deploy never queues behind testing.
- The script only ever touches the `-AppPath` it was given, and refuses to run
  against a missing folder or a non-git folder.
- A branch guard ensures each working copy stays on its own branch, so a testing
  deploy can never fast-forward production.
- Separate services, ports, log/backup folders, and separate `.env.production`
  files — therefore separate databases.

## Running the script manually

```powershell
# From an elevated PowerShell on the server
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\deploy-jivo-windows.ps1 -Environment Production
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\deploy-jivo-windows.ps1 -Environment Testing

# Fully custom target
powershell -File scripts\deploy-jivo-windows.ps1 -Environment Custom `
  -AppPath 'C:\...' -Branch feature-x -ServiceName jivo-web-x `
  -LogDirectory 'C:\...\Logs\X' -HealthCheckUrl 'http://127.0.0.1:3003/api/health'
```

Pass `-HealthCheckUrl ''` to skip the HTTP health check.

## Migration from the old deployment

The old layout was `C:\LiveProjects\NEXT_JS_WEB_JIVO.IN` + service `jivo-web`.

**1. Create the testing branch** (from your machine):

```bash
git push origin main:testing
```

**2. Run the migration script** on the server, elevated. It is idempotent, and
`-WhatIfOnly` prints the plan without changing anything:

```powershell
cd C:\LiveProjects\NEXT_JS_WEB_JIVO.IN
git pull origin main
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\setup-jivo-environments.ps1 -WhatIfOnly
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\setup-jivo-environments.ps1
```

It creates the folder tree, stops `jivo-web`, **moves** the existing working copy
to `_LIVE` (preserving git history, `node_modules` and the untracked
`.env.production`), clones `testing` into `_TEST`, registers `jivo-web-live` and
`jivo-web-test` with their ports, and removes the old `jivo-web` service.

**3. Create the testing env file.** It is deliberately not copied, because
testing must not point at the live database:

```
C:\LiveProjects\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_TEST\.env.production

NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/jivo_test
AUTH_SECRET=<a NEW secret, not the live one>
AUTH_URL=https://abc.jivo.in
NEXT_PUBLIC_APP_URL=https://abc.jivo.in
```

`DATABASE_URL` must use `localhost`, and any special characters in the password
must be %-encoded.

**4. Build both once and start the services:**

```powershell
cd C:\LiveProjects\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_LIVE ; npm install ; npm run build ; nssm start jivo-web-live
cd C:\LiveProjects\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_TEST ; npm install ; npm run build ; nssm start jivo-web-test
```

**5. Reverse proxy / DNS:** point `jivo.in` → `127.0.0.1:3001` and
`abc.jivo.in` → `127.0.0.1:3002`, and add a DNS A record for `abc.jivo.in`.
Give `abc.jivo.in` its own TLS certificate.

**6. Verify:**

```powershell
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1:3002/api/health
```

Then push a trivial commit to `testing` and confirm only the testing workflow
runs and only `_TEST` changes.

### Port configuration note

`package.json` previously hardcoded `next start -p 3001`. It is now plain
`next start`, so each service takes its port from the `PORT` environment
variable set by NSSM (`AppEnvironmentExtra`). Without this change both services
would try to bind 3001. If you start the app manually, set `PORT` first.

### Rollback

Automatic on failure. To roll back by hand:

```powershell
cd C:\LiveProjects\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_LIVE
git reset --hard <commit>   # see Backups\Production\deploy-history.txt
npm install ; npm run build ; nssm restart jivo-web-live
```

### GitHub secrets

`HOST`, `USERNAME`, `SSH_PRIVATE_KEY`, `PORT` (SSH port) — shared by both
workflows. Each workflow also references a GitHub *environment* (`production` /
`testing`), which you can use to add required reviewers for production deploys.
