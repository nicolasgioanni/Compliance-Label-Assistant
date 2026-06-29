# Frontend On Vercel

## Project Settings

| Setting | Value |
| --- | --- |
| Project root | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | Not currently documented in code; Vercel default npm install is expected. |

`frontend/vercel.json` is checked in for lightweight static security headers and exact SPA rewrites for `/about`, `/app`, `/license`, `/privacy`, and `/terms`.

## Environment Variables

| Name | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `<BACKEND_URL>` |

Vercel configuration excludes backend provider secrets.

## Preview And Production Notes

- Preview deployments need a backend URL that is reachable from the browser.
- Production deployments use the production Render backend URL.
- The production branch is `main`.
- Production promotion depends on protected `main` and the required GitHub checks: `backend-ci`, `frontend-ci`, and `repo-hygiene`.
- Vercel deployment protection or deployment checks are dashboard controls when available for the project.
- If a preview frontend uses a different origin, add that origin to backend `ALLOWED_ORIGINS`.
- A CSP is intentionally not configured in this prototype because the backend API origin is deployment-specific.

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

- Vercel output directory is `dist`, not repository root.

## Production Checklist

- `VITE_API_BASE_URL` points to deployed backend.
- No provider key is configured in frontend environment variables.
- Static response headers from `frontend/vercel.json` are present in deployment responses.
- `npm run lint`, `npm run typecheck`, `npm run test:coverage -- --run`, and `npm run build` pass locally.
- GitHub required checks `backend-ci`, `frontend-ci`, and `repo-hygiene` pass on the commit being deployed.
- Production deployment or promotion is limited to protected `main`.
- Backend CORS includes the Vercel production origin.
