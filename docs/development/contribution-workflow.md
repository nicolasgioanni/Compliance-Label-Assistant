# Contribution Workflow

## Goal

Keep changes small, accurate, and aligned with the frontend/backend boundaries already present in the repository.

## Frontend Changes

1. Put endpoint calls in `frontend/src/api/verificationApi.js`.
2. Put reusable logic in `frontend/src/utils`.
3. Put reusable stateful user interface logic in `frontend/src/hooks`.
4. Keep components focused on rendering and event wiring.
5. Add or update tests near the behavior being changed.
6. Update docs when commands, env vars, queue behavior, export behavior, or API calls change.

## Backend Changes

1. Keep route handlers thin.
2. Put workflow orchestration in `backend/app/services`.
3. Put provider-specific code in `backend/app/providers/openai`.
4. Put upload validation and preprocessing in `backend/app/image_processing`.
5. Put deterministic comparison behavior in `backend/app/verification`.
6. Put generic helpers in `backend/app/utils`.
7. Read configuration through `backend/app/config.py`.
8. Update tests and docs when behavior changes.

## API Changes

1. Update request/response models in `backend/app/schemas.py`.
2. Update route handling in `backend/app/routes`.
3. Update frontend API client mapping if the browser calls the endpoint.
4. Update tests in `backend/app/tests/test_api_contract.py`.
5. Update `docs/api/`.

## Documentation Changes

1. Keep root `README.md` short.
2. Put detailed behavior docs under `docs/`.
3. Update file references when files are added, renamed, removed, or repurposed.
4. Mark unclear behavior as `Needs confirmation`.
5. Do not include real secrets or local `.env` values.

## Review Checklist

- Behavior matches docs.
- API contracts match code.
- Env vars match `config.py` and frontend API client usage.
- Tests cover changed behavior.
- No secret values are committed.
- Generated folders and logs are not committed.
