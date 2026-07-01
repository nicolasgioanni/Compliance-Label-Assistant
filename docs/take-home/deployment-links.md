# Deployment Links

Last updated: 2026-07-01

## Application URLs

| Target | URL |
| --- | --- |
| Frontend landing page | https://compliance-label-assistant.vercel.app |
| Frontend about page | https://compliance-label-assistant.vercel.app/about |
| Frontend verification tool | https://compliance-label-assistant.vercel.app/app |
| Frontend Privacy Policy | https://compliance-label-assistant.vercel.app/privacy |
| Frontend Terms of Use | https://compliance-label-assistant.vercel.app/terms |
| Frontend License | https://compliance-label-assistant.vercel.app/license |
| Backend API URL | https://compliance-label-assistant.onrender.com |
| Source repository | https://github.com/nicolasgioanni/Compliance-Label-Assistant |

These are public URLs for evaluator review. Do not add private dashboard URLs, API keys, provider keys, access tokens, credentials, or real environment values.

## Deployment Platform

- Frontend: Vercel
- Backend API: Render Starter

## Deployment Notes

- The frontend deployment sets `VITE_API_BASE_URL` to the public backend API base URL.
- The backend deployment configures `OPENAI_API_KEY` and `ALLOWED_ORIGINS` in Render environment settings.
- The frontend must not receive backend provider secrets.
- Detailed deployment setup lives in [../deployment/frontend-vercel.md](../deployment/frontend-vercel.md) and [../deployment/backend-render.md](../deployment/backend-render.md).
