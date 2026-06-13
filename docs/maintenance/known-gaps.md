# Known Gaps

## Confirmed Missing From Repository

- No checked-in Render config.
- No Dockerfile or docker-compose config.
- No GitHub Actions-controlled deployment workflow; deployments remain dashboard-configured after required checks pass.
- No backend typecheck command.
- No frontend coverage threshold.
- No backend coverage threshold.
- No required browser smoke workflow.
- No database or persistent upload storage.
- No authentication or authorization.
- No production rate limiting or monitoring.

## Current Behavior To Keep Clear

- The frontend queue calls `/verify` once per selected or ready label.
- The frontend does not call `/verify-batch`.
- The backend `/verify-batch` uses one shared expected field set for all files.
- The route accepts `government_warning`, but backend verification uses `STANDARD_GOVERNMENT_WARNING`.
- The provider parser currently sets `raw_text` to `null`.
- OpenAI clients are cached, but extraction results are not cached.
- `frontend/vercel.json` defines static security headers only; CSP is not configured.
- `sample-data/` contains synthetic label fixtures; TC08 verifies a country-of-origin mismatch using mocked extraction data.

## Needs Confirmation

- Formal release tagging process.
- Formal commit message convention.
- Production monitoring requirements.
- Production retention requirements for logs.
- Production rate-limit requirements.
- Whether cloud AI is allowed in the target deployment network.
- Whether future sample data should add more beverage types, label formats, and supported field categories.
