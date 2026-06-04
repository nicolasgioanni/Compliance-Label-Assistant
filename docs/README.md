# Documentation

Full architecture, security, performance, API contract, and limitations documentation will be expanded after batch flows are implemented.

Current Phase 3 scope:

- Backend health endpoint.
- Single-label upload validation.
- In-memory image preprocessing.
- OpenAI-backed label text extraction when `OPENAI_API_KEY` is configured.
- Deterministic backend comparison between expected and extracted fields.
- Frontend health check, upload form, expected fields form, and field-level result display.

Batch upload, CSV export, database storage, and final legal compliance decisions remain outside the current implementation.
Government warning bold text, font size, and placement checks remain documented limitations.

See `docs/implementation-plan.md` for the approved implementation plan.
