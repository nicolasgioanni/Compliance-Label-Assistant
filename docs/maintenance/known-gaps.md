# Known Gaps

## Confirmed Missing From Repository

- No `.github/` CI workflow.
- No checked-in Vercel config.
- No checked-in Render config.
- No Dockerfile or docker-compose config.
- No backend typecheck command.
- No frontend coverage command.
- No backend coverage command.
- No database or persistent upload storage.
- No authentication or authorization.
- No real sample label images in `sample-data/`.

## Current Behavior To Keep Clear

- The frontend queue calls `/verify` once per selected or ready label.
- The frontend does not call `/verify-batch`.
- The backend `/verify-batch` uses one shared expected field set for all files.
- The route accepts `government_warning`, but backend verification uses `STANDARD_GOVERNMENT_WARNING`.
- The provider parser currently sets `raw_text` to `null`.
- OpenAI clients are cached, but extraction results are not cached.

## Needs Confirmation

- Formal release tagging process.
- Formal commit message convention.
- Production monitoring requirements.
- Production retention requirements for logs.
- Whether future sample data should include synthetic images.
