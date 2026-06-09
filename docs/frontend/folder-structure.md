# Frontend Folder Structure

## Repository Location

```text
frontend/
|-- public/
|-- src/
|   |-- api/
|   |-- components/
|   |-- constants/
|   |-- hooks/
|   |-- styles/
|   `-- utils/
|-- eslint.config.js
|-- index.html
|-- jsconfig.json
|-- package.json
|-- postcss.config.cjs
`-- vite.config.js
```

## Source Folders

| Path | Purpose |
| --- | --- |
| `frontend/src/api` | Centralized backend API calls. |
| `frontend/src/components/dialogs` | Modal and dialog components. |
| `frontend/src/components/queue` | Queue list, filters, item cards, summary, and action controls. |
| `frontend/src/components/shared` | Shared shell, feedback, tooltip, and loading components. |
| `frontend/src/components/upload` | File and folder upload controls. |
| `frontend/src/components/verification` | Selected-label workspace and verification result rendering. |
| `frontend/src/constants` | Shared user interface messages and default warning text. |
| `frontend/src/hooks` | Queue orchestration and small reusable user interface hooks. |
| `frontend/src/styles` | Global CSS and component partials. |
| `frontend/src/utils` | Reusable frontend logic for validation, queue state, statuses, export, and browser support. |

## Generated And Ignored Frontend Folders

These are not documented in detail:

- `frontend/node_modules/`
- `frontend/dist/`
- `frontend/coverage/`
- Vite cache folders
- local log files

## Where To Start

- User interface shell: `frontend/src/App.jsx`
- Main workflow: `frontend/src/components/verification/VerificationForm.jsx`
- Queue state: `frontend/src/hooks/useQueueItems.js`
- Verification calls: `frontend/src/hooks/useQueueVerification.js`
- API client: `frontend/src/api/verificationApi.js`
- File validation: `frontend/src/utils/fileValidation.js`
- Export: `frontend/src/utils/resultExport.js`
