# Documentation

Full architecture, security, performance, API contract, and limitations documentation will be expanded during final hardening.

Current Phase 4 scope:

- Backend health endpoint.
- Single-label upload validation.
- In-memory image preprocessing.
- OpenAI-backed label text extraction when `OPENAI_API_KEY` is configured.
- Deterministic backend comparison between expected and extracted fields.
- Limited batch verification with shared expected application data.
- Configured 10-file default batch limit and controlled backend concurrency.
- Isolated per-file batch failures.
- Frontend health check, single/batch upload form, expected fields form, batch table, selected-row detail view, and field-level result display.

CSV export, database storage, and final legal compliance decisions remain outside the current implementation.
Government warning bold text, font size, and placement checks remain documented limitations.

See `docs/implementation-plan.md` for the approved implementation plan.
