# Deployment Links

Last updated: 2026-06-16

## Application URLs

| Target | URL |
| --- | --- |
| Deployed frontend | https://compliance-label-assistant.vercel.app |
| Backend API | https://compliance-label-assistant.onrender.com |
| Source repository | https://github.com/nicolasgioanni/label-compliance-verifier |

These are public URLs for evaluator review. Do not add private dashboard URLs, API keys, provider keys, access tokens, credentials, or real environment values.

## Deployment Platform

- Frontend: Vercel
- Backend API: Render Starter

## Deployment Notes

- The frontend deployment should set `VITE_API_BASE_URL` to the public backend API base URL.
- The backend deployment should configure `OPENAI_API_KEY` and `ALLOWED_ORIGINS` in Render environment settings.
- The frontend must not receive backend provider secrets.
- Detailed deployment setup lives in [../deployment/frontend-vercel.md](../deployment/frontend-vercel.md) and [../deployment/backend-render.md](../deployment/backend-render.md).
