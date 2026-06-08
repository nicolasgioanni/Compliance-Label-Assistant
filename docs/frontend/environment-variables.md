# Frontend Environment Variables

## Source Of Truth

Frontend runtime configuration is read in:

- `frontend/src/api/verificationApi.js`

Example placeholders live in:

- `frontend/.env.example`

## Variables

| Name | Required | Secret | Default | Purpose | Configure locally | Configure in Vercel |
| --- | --- | --- | --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Optional for local default, required for deployed frontend | No | `http://localhost:8000` | Backend API base URL used by the browser. | `frontend/.env` or process env | Vercel project environment variable |

## Safe Examples

Local:

```text
VITE_API_BASE_URL=http://localhost:8000
```

Deployed:

```text
VITE_API_BASE_URL=<BACKEND_URL>
```

## Notes

- Do not put `OPENAI_API_KEY` or other provider secrets in frontend env files.
- Vite exposes `VITE_` variables to browser code.
- Local `frontend/.env` is ignored by Git.
