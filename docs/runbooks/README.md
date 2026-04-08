# Operational Runbooks

Incident response playbooks for the Acme Logistics platform.

## Runbook Index

| Runbook | Scenario | Severity |
|---------|----------|----------|
| [Backend API Outage](./backend-api-outage.md) | API is unreachable or returning 5xx errors | Critical |
| [Database Issues](./database-issues.md) | SQLite corruption, lock contention, or migration failures | High |
| [Frontend Deployment Failure](./frontend-deployment-failure.md) | Next.js build or deployment fails | High |
| [High API Latency](./high-api-latency.md) | API response times exceed acceptable thresholds | Medium |
| [CI Pipeline Failure](./ci-pipeline-failure.md) | GitHub Actions CI workflow fails | Medium |

## Incident Severity Levels

| Level | Definition | Response Time |
|-------|-----------|---------------|
| **Critical** | Service fully unavailable, data loss risk | Immediate (< 15 min) |
| **High** | Major feature broken, degraded performance | < 1 hour |
| **Medium** | Minor feature impacted, workaround available | < 4 hours |
| **Low** | Cosmetic issue, no user impact | Next business day |

## General Incident Response Process

1. **Detect** - Identify the issue via monitoring, alerts, or user reports
2. **Triage** - Assess severity and impact using the levels above
3. **Diagnose** - Follow the relevant runbook to identify root cause
4. **Resolve** - Apply the fix described in the runbook
5. **Verify** - Confirm the fix resolves the issue
6. **Post-mortem** - Document what happened and any preventive measures
