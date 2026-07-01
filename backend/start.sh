#!/usr/bin/env bash
set -euo pipefail

# Render provides PORT in production; local runs fall back to 8000.
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"

