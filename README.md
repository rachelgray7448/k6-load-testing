
# k6 Starter Project

This is a starter template for running Grafana k6 load tests with GitHub Actions.

## Files

- **tests/loadtest.js** — example GraphQL load test
- **.github/workflows/k6.yml** — GitHub Actions workflow
- **summary.json** — generated after test runs (in CI)

## Running Locally

```bash
k6 run tests/loadtest.js
```

## Running in Cloud

```bash
k6 cloud tests/loadtest.js
```

## GitHub Secrets Needed

- `K6_CLOUD_API_TOKEN`
- `K6_PROJECT_ID`
