2025-12-09 – Lines App – CI/CD Pipeline

---

**CI platforms**
- GitHub Actions: primary CI for build, tests, and on-demand runs.

**Workflows**
- **`.github/workflows/ci.yml`**: standard CI for `main` (push/PR).
  - Uses `actions/setup-node@v4` with `cache: "pnpm"` and `cache-dependency-path: lines-app/pnpm-lock.yaml` so pnpm caching works correctly in the monorepo.
  - Runs all commands from `./lines-app` via `defaults.run.working-directory`.
  - Steps: checkout → Node setup → `pnpm install` → `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build`.

- **`.github/workflows/run-tests-on-demand.yml`**: manual `workflow_dispatch` to trigger unit, integration, e2e, or all tests.
  - Job `run-tests` runs from `./lines-app`.
  - Uses `actions/setup-node@v4` with pnpm cache bound to `lines-app/pnpm-lock.yaml` so the setup step does not fail when the repo root has no lockfile.
  - Installs dependencies, generates Prisma client, optionally installs Playwright browsers, runs the selected test suites, parses JSON results, and posts them to an external webhook.

- **`.github/workflows/playwright.yml`**: Playwright e2e regression suite on push/PR to `main` / `develop`.
  - Runs all `pnpm` commands from `./lines-app` using `defaults.run.working-directory`.
  - Uses `actions/setup-node@v4` with `cache: "pnpm"` and `cache-dependency-path: lines-app/pnpm-lock.yaml` to share the same cache key as other workflows.
  - Installs dependencies and Playwright browsers, runs `pnpm test:e2e`, and uploads the `playwright-report` artifact.

**Key conventions**
- `pnpm-lock.yaml` is stored only inside `lines-app/`; all workflows must reference it via `cache-dependency-path: lines-app/pnpm-lock.yaml` when enabling pnpm caching.
- Any new workflow that runs pnpm must:
  - Set `defaults.run.working-directory: ./lines-app` (or an equivalent explicit working directory).
  - Use the same pnpm cache convention to avoid cache lookup failures in CI.
