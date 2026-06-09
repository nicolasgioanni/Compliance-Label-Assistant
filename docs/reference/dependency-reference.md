# Dependency Reference

## Frontend Dependencies

Source: `frontend/package.json`

Runtime dependencies:

| Dependency | Version | Used for |
| --- | --- | --- |
| `react` | `18.3.1` | User interface rendering. |
| `react-dom` | `18.3.1` | React DOM root rendering. |
| `vite` | `6.4.3` | Dev server and build tool. |
| `@vitejs/plugin-react` | `4.3.4` | React support in Vite. |
| `write-excel-file` | `^4.1.0` | Browser `.xlsx` export. |

Development dependencies:

| Dependency | Used for |
| --- | --- |
| `eslint`, `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `globals` | Linting JavaScript, React, and hooks. |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | JS typecheck support through `frontend/jsconfig.json`. |
| `vitest`, `jsdom` | Frontend test runner and DOM environment. |
| `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` | Component and interaction tests. |
| `postcss`, `autoprefixer` | CSS post-processing. |

Lockfile internals are not documented.

## Backend Dependencies

Source: `backend/requirements.txt`

| Dependency | Version | Used for |
| --- | --- | --- |
| `fastapi` | `0.115.6` | Backend web framework and routing. |
| `uvicorn[standard]` | `0.34.0` | ASGI server for local and deployment startup. |
| `python-multipart` | `0.0.20` | Multipart form upload parsing. |
| `Pillow` | `12.2.0` | Image validation, orientation, resizing, conversion, and JPEG compression. |
| `openai` | `>=2.38.0,<3.0.0` | OpenAI provider SDK. |
| `httpx` | `0.28.1` | HTTP client dependency used by backend tests/framework ecosystem. |
| `pytest` | `8.3.4` | Backend test runner. |
| `ruff` | `0.8.6` | Backend linting. |

Transitive dependencies are not documented individually.

## Runtime Version

`backend/runtime.txt` declares:

```text
python-3.11.9
```

## Dependency Change Notes

- Update `frontend/package-lock.json` when frontend dependencies change.
- Update validation docs if dependency changes alter available commands.
- Re-run frontend and backend validation after dependency changes.
