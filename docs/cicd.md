# CI/CD: Auto-Deploy to Windows Server on Push to `main`

## Architecture

```
Developer pushes to main
        │
        ▼
GitHub detects push → triggers GitHub Actions workflow
        │
        ▼
Self-hosted runner ON YOUR WINDOWS SERVER picks up the job
        │
        ▼
Runner executes: pull → install → prisma generate → build → restart service
        │
        ▼
Site is live with new code
```

No SSH, no exposed webhooks, no Docker — the runner lives on your server and does everything locally.

---

## Step 1: Install GitHub Actions Self-Hosted Runner on Your Server

### 1.1 — Create the Runner in GitHub

1. Go to your repo → **Settings → Actions → Runners → New self-hosted runner**
2. Select **Windows** and **x64**
3. GitHub will show you commands — run them on your **Windows Server**

```powershell
# Open PowerShell as Administrator on your Windows Server

# Create a folder for the runner
mkdir C:\actions-runner
cd C:\actions-runner

# Download the latest runner (GitHub will show the exact URL and version)
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-win-x64-2.322.0.zip -OutFile actions-runner.zip

# Extract
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner.zip", "$PWD")
```

### 1.2 — Configure the Runner

```powershell
# GitHub will give you the exact token — replace YOUR_TOKEN
.\config.cmd --url https://github.com/jivoit01-collab/NEXT_JS_WEB_JIVO.IN --token YOUR_TOKEN
```

It will prompt you:

| Prompt         | Enter                              |
| -------------- | ---------------------------------- |
| Runner group   | Press Enter (default)              |
| Runner name    | `jivo-windows-server`              |
| Labels         | `self-hosted,windows,production`   |
| Work folder    | Press Enter (default `_work`)      |

### 1.3 — Install Runner as a Windows Service

This makes the runner start on boot and survive reboots.

```powershell
.\svc.cmd install
.\svc.cmd start
.\svc.cmd status
```

The runner now appears as **green/idle** in your GitHub repo → Settings → Actions → Runners.

---

## Step 2: Create the GitHub Actions Workflow

Create the file `.github/workflows/deploy.yml` in your project:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

  # Allow manual trigger from GitHub UI
  workflow_dispatch:

# Prevent multiple deployments running at the same time
concurrency:
  group: production-deploy
  cancel-in-progress: false

jobs:
  deploy:
    name: Build & Deploy
    runs-on: [self-hosted, windows, production]
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run database migrations
        run: npx prisma db push --skip-generate

      - name: Build Next.js
        run: npm run build

      - name: Restart application service
        run: |
          nssm restart JivoWeb
          Start-Sleep -Seconds 5

      - name: Health check
        run: |
          $maxRetries = 5
          $retryCount = 0
          $success = $false

          while ($retryCount -lt $maxRetries -and -not $success) {
            try {
              $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
              if ($response.StatusCode -eq 200) {
                Write-Host "Health check passed! Status: $($response.StatusCode)"
                $success = $true
              }
            } catch {
              $retryCount++
              Write-Host "Attempt $retryCount/$maxRetries failed. Retrying in 5s..."
              Start-Sleep -Seconds 5
            }
          }

          if (-not $success) {
            Write-Error "Health check failed after $maxRetries attempts!"
            exit 1
          }

      - name: Deployment summary
        if: success()
        run: |
          Write-Host "Deployment successful!"
          Write-Host "Commit: ${{ github.sha }}"
          Write-Host "Branch: ${{ github.ref_name }}"
          Write-Host "Triggered by: ${{ github.actor }}"
```

---

## Step 3: Add GitHub Secrets for Environment Variables

Go to your repo → **Settings → Secrets and variables → Actions** and add these secrets:

| Secret Name            | Value                                                  |
| ---------------------- | ------------------------------------------------------ |
| `DATABASE_URL`         | `postgresql://user:PROD_PASSWORD@db-host:5432/jivo_site` |
| `AUTH_SECRET`          | Your production auth secret                            |
| `AUTH_URL`             | `https://jivo.in`                                      |
| `ADMIN_EMAIL`          | `admin@jivo.in`                                        |
| `ADMIN_PASSWORD`       | Your production admin password                         |
| `NEXT_PUBLIC_APP_URL`  | `https://jivo.in`                                      |

> **Note:** Since the runner runs directly on your server where `.env.local` already exists, the build will pick up those values automatically. Secrets are a cleaner approach but either method works.

---

## Step 4: Protect the `main` Branch

Go to repo → **Settings → Branches → Add rule**:

| Setting                              | Value                                    |
| ------------------------------------ | ---------------------------------------- |
| Branch name pattern                  | `main`                                   |
| Require pull request before merging  | Yes                                      |
| Require status checks to pass        | Optional — add a lint/test job later     |
| Include administrators               | Yes                                      |

This ensures no one pushes broken code directly to `main` — all changes go through PRs.

---

## Step 5: Deploy Notifications (Optional)

Add a Discord/Slack webhook URL as a secret `DISCORD_WEBHOOK`, then append these steps to the workflow:

```yaml
      - name: Notify on success
        if: success()
        run: |
          $body = @{
            content = "Jivo.in deployed successfully! Commit: ${{ github.sha }} by ${{ github.actor }}"
          } | ConvertTo-Json
          Invoke-RestMethod -Uri "${{ secrets.DISCORD_WEBHOOK }}" -Method Post -Body $body -ContentType "application/json"

      - name: Notify on failure
        if: failure()
        run: |
          $body = @{
            content = "@here Jivo.in deployment FAILED! Check: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
          } | ConvertTo-Json
          Invoke-RestMethod -Uri "${{ secrets.DISCORD_WEBHOOK }}" -Method Post -Body $body -ContentType "application/json"
```

---

## Full Flow

```
1. You develop on a feature branch (e.g., navbar/footer-setup)
          │
          ▼
2. Push branch → Create PR to main
          │
          ▼
3. Review & merge PR into main
          │
          ▼
4. GitHub Actions triggers deploy.yml
          │
          ▼
5. Self-hosted runner on your Windows Server:
   ├── git checkout (fresh code)
   ├── npm ci
   ├── prisma generate + db push
   ├── npm run build
   ├── nssm restart JivoWeb
   └── health check passes → DONE
          │
          ▼
6. https://jivo.in is live with new code in ~2-3 minutes
```

---

## Testing the Pipeline

```bash
# From your current branch, merge to main and push
git checkout main
git merge navbar/footer-setup
git push origin main
```

Then go to **Actions** tab in your GitHub repo and watch the workflow run in real-time.

---

## Troubleshooting

| Issue                                | Fix                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| Runner shows offline                 | Check service: `.\svc.cmd status` in `C:\actions-runner`                     |
| Build fails with memory error        | Add `NODE_OPTIONS=--max-old-space-size=4096` as env in the workflow          |
| `nssm restart` permission denied     | Runner service must run as Administrator or the same user as NSSM            |
| Health check fails                   | Check if port 3000 is correct, check `.next` folder exists                   |
| Prisma errors                        | Make sure `DATABASE_URL` is accessible from server                           |

---

## Runner Management Commands

```powershell
# Check runner status
cd C:\actions-runner
.\svc.cmd status

# Restart runner
.\svc.cmd stop
.\svc.cmd start

# Uninstall runner (if needed)
.\svc.cmd uninstall
.\config.cmd remove --token YOUR_TOKEN
```
