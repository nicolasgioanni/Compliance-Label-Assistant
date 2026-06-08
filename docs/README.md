# Documentation

This folder documents the current prototype implementation and the approved roadmap.

- [Architecture](architecture.md)
- [Frontend Process](frontend-process.md)
- [Security](security.md)
- [Testing](testing.md)
- [Performance](performance.md)
- [API Contract](api-contract.md)
- [Local Development](local-development.md)
- [Assumptions And Limitations](assumptions-limitations.md)
- [Deployment](deployment.md)
- [Implementation Plan](implementation-plan.md)

The implemented app supports a unified frontend label queue, per-label verification, frontend-only human final decisions, the backend batch endpoint, and client-side CSV and Excel export for verified queue results. Manual final decisions are kept in browser memory for the current page session and are reflected in queue badges, summary counts, selected-label status, and exports. CSV import by filename-to-expected-field mapping is a future scalability improvement, not a current feature. Human review remains final.
