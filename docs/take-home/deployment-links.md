# Deployment Links

Last updated: 2026-06-11

## Application URLs

| Target | URL |
| --- | --- |
| Frontend landing page | https://compliance-label-assistant.vercel.app |
| Frontend about page | https://compliance-label-assistant.vercel.app/about |
| Frontend verification tool | https://compliance-label-assistant.vercel.app/app |
| Frontend Privacy Policy | https://compliance-label-assistant.vercel.app/privacy |
| Frontend Terms of Use | https://compliance-label-assistant.vercel.app/terms |
| Backend API URL | https://compliance-label-assistant.onrender.com |

These are public application URLs. Private dashboard URLs remain outside this document.

## Deployment Platform

- Frontend: Vercel
- Backend API: Render Starter

## Notes

- Private dashboard URLs remain outside this document.
- API keys, provider keys, access tokens, and credentials remain outside this document.
- The frontend deployment sets `VITE_API_BASE_URL` to the public backend API base URL.
- The backend deployment configures `OPENAI_API_KEY` and `ALLOWED_ORIGINS` in Render environment settings.
- Detailed deployment setup lives in [../deployment/frontend-vercel.md](../deployment/frontend-vercel.md) and [../deployment/backend-render.md](../deployment/backend-render.md).
