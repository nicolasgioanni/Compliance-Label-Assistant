# Frontend On Vercel

## Project Settings

| Setting | Value |
| --- | --- |
| Project root | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | Not currently documented in code; Vercel default npm install is expected. |

## Environment Variables

| Name | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `<BACKEND_URL>` |

Do not configure backend provider secrets in Vercel.

## Preview And Production Notes

- Preview deployments need a backend URL that is reachable from the browser.
- Production deployments should use the production Render backend URL.
- If a preview frontend uses a different origin, add that origin to backend `ALLOWED_ORIGINS`.

## Common Failures

Frontend cannot reach backend:

- Check `VITE_API_BASE_URL`.
- Check backend service is running.
- Check backend CORS `ALLOWED_ORIGINS`.

Build fails:

- Run `npm run build` locally from `frontend/`.
- Check `frontend/package.json` scripts.
- Check dependency install output.

Wrong output directory:

- Vercel must use `dist`, not repository root.

## Production Checklist

- `VITE_API_BASE_URL` points to deployed backend.
- No provider key is configured in frontend environment variables.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass locally.
- Backend CORS includes the Vercel production origin.
