# Documentation

This folder contains the evaluator and implementation documentation for Compliance Label Assistant. It describes the current React and Vite frontend, FastAPI backend, backend-only OpenAI extraction boundary, deterministic verification rules, local scripts, deployment settings, tests, and reference material.

For fast review, start with the root [README](../README.md) and [Reviewer Guide](../REVIEWER_GUIDE.md). Use this index for deeper technical details. The `docs/take-home/` folder is evaluator-facing summary documentation; the architecture, frontend, backend, API, deployment, development, security, and reference folders are the implementation reference.

## Reviewer-Facing Docs

- [Reviewer Guide](../REVIEWER_GUIDE.md)
- [Take-Home Project Brief](take-home/project-brief.md)
- [Engineering Decisions](take-home/engineering-decisions.md)
- [Setup And Run Guide](take-home/setup-and-run.md)
- [Requirements Mapping](take-home/requirements-mapping.md)
- [Deployment Links](take-home/deployment-links.md)

## Suggested Reading Order

1. [Reviewer Guide](../REVIEWER_GUIDE.md)
2. [README](../README.md)
3. [Take-Home Project Brief](take-home/project-brief.md)
4. [Engineering Decisions](take-home/engineering-decisions.md)
5. [Setup And Run Guide](take-home/setup-and-run.md)
6. [System Overview](architecture/system-overview.md)
7. [Data Flow](architecture/data-flow.md)
8. [API Overview](api/overview.md)
9. [Frontend Overview](frontend/overview.md)
10. [Backend Overview](backend/overview.md)
11. [Security](security.md)
12. [Testing And Validation](development/testing-and-validation.md)
13. [Deployment Overview](deployment/overview.md)
14. [Repository Map](reference/repository-map.md)
15. [Known Gaps](maintenance/known-gaps.md)

## Architecture

- [System Overview](architecture/system-overview.md)
- [Frontend Architecture](architecture/frontend-architecture.md)
- [Backend Architecture](architecture/backend-architecture.md)
- [Data Flow](architecture/data-flow.md)
- [Extraction And Verification Flow](architecture/extraction-verification-flow.md)
- [Error Handling](architecture/error-handling.md)
- [Performance And Cost](architecture/performance-and-cost.md)

## Frontend

- [Overview](frontend/overview.md)
- [Setup](frontend/setup.md)
- [Folder Structure](frontend/folder-structure.md)
- [Components](frontend/components.md)
- [Hooks](frontend/hooks.md)
- [Services And API Client](frontend/services-and-api-client.md)
- [State And Queue Flow](frontend/state-and-queue-flow.md)
- [Styling](frontend/styling.md)
- [Testing](frontend/testing.md)
- [Environment Variables](frontend/environment-variables.md)

## Backend

- [Overview](backend/overview.md)
- [Setup](backend/setup.md)
- [Folder Structure](backend/folder-structure.md)
- [Routes](backend/routes.md)
- [Services](backend/services.md)
- [Schemas And Models](backend/schemas-and-models.md)
- [Image Processing](backend/image-processing.md)
- [Extraction Provider](backend/extraction-provider.md)
- [Verification](backend/verification.md)
- [Caching](backend/caching.md)
- [Configuration](backend/configuration.md)
- [Logging And Errors](backend/logging-and-errors.md)
- [Testing](backend/testing.md)
- [Environment Variables](backend/environment-variables.md)

## API

- [Overview](api/overview.md)
- [Endpoints](api/endpoints.md)
- [Request And Response Contracts](api/request-response-contracts.md)
- [Error Responses](api/error-responses.md)

## Deployment

- [Overview](deployment/overview.md)
- [Frontend On Vercel](deployment/frontend-vercel.md)
- [Backend On Render](deployment/backend-render.md)
- [Environment Variables](deployment/environment-variables.md)
- [Production Checklist](deployment/production-checklist.md)

## Development

- [Local Development](development/local-development.md)
- [Testing And Validation](development/testing-and-validation.md)
- [Source Control](development/source-control.md)
- [Contribution Workflow](development/contribution-workflow.md)
- [Security And Privacy](development/security-and-privacy.md)
- [Troubleshooting](development/troubleshooting.md)

## Security And Privacy

- [Security](security.md)
- [Development Security And Privacy](development/security-and-privacy.md)
- [Backend Environment Variables](backend/environment-variables.md)
- [Deployment Environment Variables](deployment/environment-variables.md)

## Reference

- [Repository Map](reference/repository-map.md)
- [Frontend File Reference](reference/frontend-file-reference.md)
- [Backend File Reference](reference/backend-file-reference.md)
- [Config And Scripts Reference](reference/config-and-scripts-reference.md)
- [Dependency Reference](reference/dependency-reference.md)

## Maintenance

- [Documentation Maintenance](maintenance/documentation-maintenance.md)
- [Known Gaps](maintenance/known-gaps.md)
