# Documentation Maintenance

## Purpose

Keep documentation synchronized with actual code, commands, environment variables, API contracts, deployment settings, and tests.

## When To Update Docs

Update docs when changing:

- frontend workflow or queue behavior
- backend routes, services, schemas, or verification rules
- API request or response fields
- environment variables
- deployment settings
- local scripts or commands
- tests or validation commands
- dependency files
- file structure

## Accuracy Checklist

- File paths exist.
- Endpoint paths match route decorators.
- Request fields match route form parameters.
- Response fields match Pydantic models.
- Frontend API calls match `verificationApi.js`.
- Environment variables match `backend/app/config.py` and `frontend/src/api/verificationApi.js`.
- Commands match `frontend/package.json`, `backend/requirements.txt`, and scripts.
- Deployment settings match checked-in runtime files and documented platform settings.

## Safety Checklist

- No real secret values.
- No local `.env` contents.
- No private dashboard URLs unless explicitly safe and intended for public docs.
- No raw uploaded payloads.
- No base64 image payloads.
- No provider instruction text.

## Reference Docs

When files are added, moved, or removed, update:

- [Repository Map](../reference/repository-map.md)
- [Frontend File Reference](../reference/frontend-file-reference.md)
- [Backend File Reference](../reference/backend-file-reference.md)
- [Config And Scripts Reference](../reference/config-and-scripts-reference.md)
- [Dependency Reference](../reference/dependency-reference.md)

## Marking Uncertainty

If behavior cannot be confirmed from code or checked-in config, mark it as:

- `Needs confirmation`
- `Not currently documented in code`

Do not fill gaps with assumptions that read like implemented behavior.
