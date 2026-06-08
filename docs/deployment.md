# Deployment

## Frontend On Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_BASE_URL=https://your-render-api.onrender.com`

The frontend calls only the backend API. Do not configure an OpenAI API key in Vercel.

## Backend On Render

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `OPENAI_TIMEOUT_SECONDS`
  - `OPENAI_IMAGE_DETAIL`
  - `OPENAI_MAX_RETRIES`
  - `OPENAI_EXTRACTION_CONCURRENCY`
  - `MAX_FILE_SIZE_MB`
  - `MAX_IMAGE_PIXELS`
  - `MAX_BATCH_SIZE`
  - `BATCH_CONCURRENCY`
  - `MAX_IMAGE_WIDTH`
  - `JPEG_QUALITY`
  - `ALLOWED_ORIGINS`

Set `ALLOWED_ORIGINS` to the deployed Vercel URL. Keep file and batch limits conservative for cost and latency control.

## Local Port Note

If Windows cannot bind to port `8000`, use another port:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8010
```

Then set `VITE_API_BASE_URL` to the matching backend URL before starting the frontend.
