# Deployment Links

Last updated: 2026-06-09

## Application URLs

| Target | URL |
| --- | --- |
| Frontend deployed URL | https://compliance-label-assistant.vercel.app |
| Backend API URL | https://compliance-label-assistant.onrender.com |

These are public application URLs. Do not add private dashboard URLs.

## Deployment Platform

- Frontend: Vercel
- Backend API: Render Starter

## Notes

- Do not add private dashboard URLs.
- Do not add API keys, provider keys, access tokens, or credentials.
- The frontend deployment should set `VITE_API_BASE_URL` to the public backend API base URL.
- The backend deployment should configure `OPENAI_API_KEY` and `ALLOWED_ORIGINS` in Render environment settings.
- Detailed deployment setup lives in [../deployment/frontend-vercel.md](../deployment/frontend-vercel.md) and [../deployment/backend-render.md](../deployment/backend-render.md).
