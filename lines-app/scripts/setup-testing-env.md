# Setup Testing Environment Variables

This guide will help you configure all required environment variables for the testing system in Vercel.

## Step 1: Setup Vercel KV (Redis)

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `lines-app`
3. Go to **Storage** tab
4. Click **Create Database** → Select **KV** (Redis)
5. Choose a name (e.g., `lines-kv`)
6. Select a region
7. After creation, go to the KV database
8. Copy the following values:
   - `KV_URL` (or `KV_REST_API_URL`)
   - `KV_REST_API_TOKEN`

## Step 2: Create GitHub Personal Access Token

1. Go to GitHub: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Name it: `Lines App - Testing Workflow`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)

## Step 3: Get Your Repository Name

Your repository appears to be: `BenSwDev/lines`

If different, check with: `git remote get-url origin`

The format should be: `owner/repo`

## Step 4: Generate Webhook Secret

Run this command to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output.

## Step 5: Set Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add the following variables (one by one):

### Required Variables:

| Variable Name         | Value                        | Example                                                |
| --------------------- | ---------------------------- | ------------------------------------------------------ |
| `KV_URL`              | From Vercel KV storage       | `redis://...`                                          |
| `KV_REST_API_URL`     | From Vercel KV storage       | `https://...`                                          |
| `KV_REST_API_TOKEN`   | From Vercel KV storage       | `...`                                                  |
| `GITHUB_TOKEN`        | GitHub Personal Access Token | `ghp_...`                                              |
| `GITHUB_REPO`         | Your repository              | `BenSwDev/lines`                                       |
| `WEBHOOK_SECRET`      | Generated random secret      | `abc123...`                                            |
| `WEBHOOK_URL`         | Your webhook endpoint        | `https://lines-app.vercel.app/api/admin/tests/webhook` |
| `NEXT_PUBLIC_APP_URL` | Your production URL          | `https://lines-app.vercel.app`                         |

### Notes:

- Set all variables for **Production**, **Preview**, and **Development** environments
- `WEBHOOK_URL` should use your actual production domain
- `NEXT_PUBLIC_APP_URL` should match your actual Vercel app URL

## Step 6: Add GitHub Secrets (for GitHub Actions)

1. Go to your GitHub repository: https://github.com/BenSwDev/lines
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Secret Name           | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| `POSTGRES_PRISMA_URL` | Your database connection string                        |
| `WEBHOOK_URL`         | `https://lines-app.vercel.app/api/admin/tests/webhook` |
| `WEBHOOK_SECRET`      | Same value as in Vercel env vars                       |
| `NEXT_PUBLIC_APP_URL` | `https://lines-app.vercel.app`                         |

## Step 7: Redeploy

After setting all environment variables:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Find the latest deployment
3. Click **Redeploy** (or push a new commit)

## Step 8: Test

1. Go to your app: `/admin`
2. Click on **הרצת טסטים** (Run Tests) tab
3. Click **הרץ טסטים** on any test type
4. You should see it trigger GitHub Actions workflow
5. Check GitHub Actions tab to see the workflow running

## Troubleshooting

### Error: "GITHUB_REPO environment variable is not set"

- Check that `GITHUB_REPO` is set in Vercel
- Format must be: `owner/repo` (e.g., `BenSwDev/lines`)

### Error: "Redis not configured"

- Make sure Vercel KV is created and connected
- Check that `KV_URL` or `KV_REST_API_URL` is set
- Check that `KV_REST_API_TOKEN` is set

### Error: "Unauthorized" in webhook

- Make sure `WEBHOOK_SECRET` is the same in both Vercel and GitHub secrets
- Make sure `WEBHOOK_URL` is correct

### Workflow doesn't trigger

- Check GitHub token has `workflow:write` permission
- Check `GITHUB_REPO` format is correct
- Check workflow file exists: `.github/workflows/run-tests-on-demand.yml`
