# Runbook: Frontend Deployment Failure

**Severity**: High
**Services affected**: Frontend (Next.js)
**On-call**: Frontend team

## Symptoms

- `pnpm build` exits with a non-zero code
- CI "Frontend" job fails at the Build step
- TypeScript compilation errors or missing module errors during build

## Diagnosis Steps

### 1. Run the build locally and capture errors

```bash
pnpm build
```

Read the full error output. Common failure categories:

| Error Pattern | Likely Cause |
|---------------|-------------|
| `Type error: ...` | TypeScript strict mode violation |
| `Module not found: Can't resolve '...'` | Missing dependency or incorrect import path |
| `ESLint: ...` | Lint errors that block build (Next.js default) |
| `ENOMEM` or `JavaScript heap out of memory` | Insufficient memory for build |

### 2. Check TypeScript errors separately

```bash
cd frontend
pnpm exec tsc --noEmit
```

This isolates type errors from other build issues.

### 3. Check for lint errors

```bash
pnpm lint
```

Next.js runs ESLint during build by default. Lint errors can block production builds.

### 4. Verify dependencies are installed

```bash
cd frontend
pnpm install
# Check for peer dependency warnings
```

### 5. Check Node.js version compatibility

```bash
node --version
# Required: Node.js 20+
```

## Resolution

### Fix TypeScript errors

1. Run `pnpm exec tsc --noEmit` in the `frontend/` directory
2. Fix reported type errors in the listed files
3. Re-run `pnpm build` to confirm

### Fix lint errors

```bash
cd frontend
pnpm lint --fix
# Review auto-fixed changes, then commit
```

### Fix missing dependencies

```bash
cd frontend
pnpm install
# If a specific package is missing:
pnpm add <package-name>
```

### Fix out-of-memory errors

```bash
# Increase Node.js heap size
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### Clear build cache

```bash
cd frontend
rm -rf .next
pnpm build
```

## Verification

1. Build completes without errors:
   ```bash
   pnpm build
   ```
2. Lint passes:
   ```bash
   pnpm lint
   ```
3. Start the production build locally and verify pages load:
   ```bash
   cd frontend && pnpm start
   # Open http://localhost:3000
   ```

## Prevention

- Run `pnpm lint` and `pnpm build` locally before pushing
- The CI pipeline (`.github/workflows/ci.yml`) runs lint, type-check, and build on every PR
- Use `lint-staged` (configured in `package.json`) with Husky pre-commit hooks to catch issues early
