# Documentation

This folder is the canonical implementation documentation for Compliance Label Assistant. It describes the current React and Vite frontend, FastAPI backend, OpenAI extraction provider boundary, deterministic verification rules, local scripts, deployment settings, tests, and file-level references.

The root [README](../README.md) is the concise project entrypoint. Use this index for deeper engineering details.

## Start Here

1. [System Overview](architecture/system-overview.md)
2. [Repository Map](reference/repository-map.md)
3. [Local Development](development/local-development.md)
4. [Testing And Validation](development/testing-and-validation.md)
5. [API Overview](api/overview.md)
6. [Frontend Overview](frontend/overview.md)
7. [Backend Overview](backend/overview.md)
8. [Deployment Overview](deployment/overview.md)
9. [Troubleshooting](development/troubleshooting.md)
10. [Known Gaps](maintenance/known-gaps.md)

The `docs/take-home/` folder is intentionally separate from this implementation reference and is not used as the source of truth for current technical documentation.

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
- [Deployment Environment Variables](deployment/environment-variables.md)
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
