const GITHUB_DOC_BASE_URL = 'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/';

export const ABOUT_HERO = {
  title: 'About',
  subtitle: 'Architecture and Implementation Notes',
  description:
    'This page summarizes the project purpose, reviewer workflow, frontend and backend architecture, implementation decisions, security and privacy boundaries, deployment model, testing approach, limitations, and disclaimers behind Compliance Label Assistant.',
};

export const ABOUT_SECTION_GROUPS = [
  {
    title: 'Project and Workflow',
    sections: [
      {
        title: 'Project Overview',
        body: 'Compliance Label Assistant is a standalone prototype for comparing alcohol label artwork with expected application data. It is built for reviewers and evaluators who need a field-by-field view of likely matches, mismatches, missing values, and items that require closer human review.',
        items: [
          'Demonstrates an AI-assisted review workflow for selected alcohol-label fields.',
          'Keeps provider-based visual text extraction separate from deterministic backend comparison rules.',
          'Supports review triage without issuing official, legal, or final regulatory determinations.',
        ],
      },
      {
        title: 'Reviewer Workflow',
        body: 'A reviewer adds one or more label image files, selects a queued label, enters expected application values, runs verification, reviews the returned evidence, and exports current results when needed.',
        items: [
          'Accepted frontend upload types are JPG, PNG, WebP, and TIFF images up to the configured size limit.',
          'The browser queue supports up to 10 label images and tracks expected data per label.',
          'Reviewers can verify the selected label or run the ready-label workflow over queued labels.',
          'Results show overall status, field cards, extracted values, reasons, confidence values, timing, and exportable summaries.',
        ],
      },
      {
        title: 'Implemented Review Features',
        body: 'The current application focuses on the practical review path rather than broad case management. It validates uploads, prepares images, extracts visible fields, compares those fields to expected values, and keeps queue results organized in the browser.',
        items: [
          'Client-side validation filters unsupported, oversized, duplicate, and over-limit queue additions.',
          'The first successful queue addition triggers a best-effort backend warmup call.',
          'Changing expected data after verification marks the previous result stale until verification is rerun.',
          'CSV and XLSX exports include current verification statuses and processing time, not raw extracted text.',
        ],
      },
    ],
  },
  {
    title: 'Technical Architecture',
    sections: [
      {
        title: 'Frontend Shell and Routing',
        body: 'The frontend is a React 18 and Vite 6 application with a small app shell rather than a full routing framework. App.jsx reads the current path and renders the Home page, About page, License page, or verification workflow.',
        items: [
          'AppShell keeps the shared Header, main content area, and AppFooter consistent across routes.',
          'Header owns the Home, About, and Verification Tool navigation links and the shared backend status display.',
          'There is no React Router, server-side rendering, or frontend-hosted backend route layer in the current implementation.',
          'The frontend is deployed as a static Vite build, with Vercel rewrites sending static page paths back to index.html.',
        ],
      },
      {
        title: 'Queue State Architecture',
        body: 'The main tool is organized around browser-local queue state. Custom hooks coordinate queue item creation, selected-label review, verification locking, preview state, copy-data workflows, filters, and result transitions.',
        items: [
          'useQueueItems owns active queue items, selected item id, filter state, copy modal state, preview state, and queue-level handlers.',
          'useQueueVerification owns selected-label verification, ready-label verification, in-flight locking, and per-label error application.',
          'Queue item state tracks statuses such as needs_expected_data, ready, verifying, pass, fail, and error.',
          'Expected data edits mark current results stale so the reviewer knows verification must be rerun.',
        ],
      },
      {
        title: 'Backend Service Boundaries',
        body: 'The backend is a FastAPI service with thin route handlers and focused workflow modules. Routes parse HTTP inputs and map known exceptions, while services coordinate validation, preprocessing, extraction, verification, timing, and response construction.',
        items: [
          'backend/app/routes contains health, warmup, and verification route handlers.',
          'backend/app/services coordinates single-label verification, batch verification, timing, and warmup behavior.',
          'backend/app/image_processing owns upload validation and image preprocessing.',
          'backend/app/verification owns deterministic field rules, while backend/app/schemas.py defines response shapes.',
        ],
      },
      {
        title: 'Provider and Configuration Boundary',
        body: 'Provider-specific extraction logic is isolated from verification rules and from HTTP route handlers. Configuration is read through backend/app/config.py so settings are not scattered across routes or services.',
        items: [
          'OpenAI-specific code lives under backend/app/providers/openai and returns ExtractedFields for downstream verification.',
          'The OpenAI client factory caches clients by API key, timeout, and retry settings.',
          'Model, timeout, image detail, retry count, extraction concurrency, warmup, image width, JPEG quality, and batch limits are configured centrally.',
          'The provider-specific module boundary keeps extraction separate from deterministic comparison rules, which makes future OCR or vision-provider replacement more contained.',
        ],
      },
      {
        title: 'API and Data Flow',
        body: 'The browser talks to the backend through a small API surface. Successful verification requests return structured JSON with expected fields, extracted fields, field results, overall status, timing metrics, preprocessing metadata, and safe messages.',
        items: [
          'GET /health powers the shared header status indicator.',
          'POST /warmup initializes reusable backend dependencies without uploading label files.',
          'POST /verify verifies one label image against expected fields and is the endpoint used by the current frontend workflow.',
          'POST /verify-batch exists for 2 to MAX_BATCH_SIZE files with one shared expected field set, but the current frontend does not call it.',
        ],
      },
      {
        title: 'Repository and Deployment Structure',
        body: 'The repository is organized around the deployed frontend, backend API, supporting documentation, local development scripts, and synthetic sample data. The deployment model keeps browser assets separate from backend provider secrets.',
        items: [
          'frontend/ contains the Vite React application, components, hooks, utilities, styles, and tests.',
          'backend/ contains the FastAPI app, schemas, routes, services, provider integration, image processing, verification rules, and tests.',
          'docs/, scripts/, and sample-data/ provide architecture references, local PowerShell workflows, and synthetic fixture images.',
          'The documented deployment target is a Vercel static frontend connected to a Render backend API.',
        ],
      },
    ],
  },
  {
    title: 'Implementation and Quality',
    sections: [
      {
        title: 'Upload Validation',
        body: 'Upload validation happens on both sides of the API boundary. The frontend screens files for user experience, while the backend still performs the authoritative checks before image processing or extraction.',
        items: [
          'Frontend validation accepts JPG, PNG, WebP, and TIFF uploads and rejects unsupported or oversized files before queue insertion.',
          'Queue planning also filters duplicate basenames and files beyond the 10-label queue limit.',
          'Backend validation checks filename, extension, MIME type, decoded image format, non-empty bytes, file size, and decoded pixel count.',
          'Unreadable images and decompression-bomb style Pillow failures are converted into user-facing upload errors.',
        ],
      },
      {
        title: 'Image Preprocessing',
        body: 'After validation, uploaded image bytes are normalized in memory before provider extraction. This prepares a smaller and more predictable model input without storing uploaded files.',
        items: [
          'Pillow applies EXIF orientation and converts images to RGB.',
          'Images wider than the configured maximum width are resized before extraction.',
          'Preprocessed output is saved as optimized JPEG using the configured quality value.',
          'The backend returns preprocessing metadata such as byte count and image width in the verification response.',
        ],
      },
      {
        title: 'Extraction Pipeline',
        body: 'The extraction provider is responsible for reading visible label fields only. It does not decide whether a label passes review, and its output is parsed into backend schemas before deterministic verification runs.',
        items: [
          'The extraction prompt asks for JSON-only visible fields and preserves exact wording for government warning text.',
          'Extracted fields include brand name, class or type, alcohol content, net contents, bottler or producer, country of origin, and government warning text.',
          'The provider call uses store=false and temperature 0 in the current OpenAI integration.',
          'Configuration, rate-limit, timeout, connection, provider-status, and invalid-response failures are mapped before they reach the route response.',
        ],
      },
      {
        title: 'Deterministic Verification Rules',
        body: 'Verification rules compare expected values with extracted values using field-specific code. The backend owns the comparison logic so results are explainable and testable.',
        items: [
          'Text fields use exact matching, case and spacing normalization, punctuation normalization, token containment, and similarity thresholds where appropriate.',
          'Alcohol content parsing compares ABV and proof values with configured tolerances.',
          'Net contents normalization compares milliliters and liters with a small configured tolerance.',
          'Government warning verification checks extracted text for a GOVERNMENT WARNING heading prefix and compares wording against the backend-owned standard warning.',
          'Field statuses can be pass, normalized_match, fail, missing, needs_review, or error.',
          'Overall status is pass only when all checked fields pass; otherwise non-error mismatches become fail.',
        ],
      },
      {
        title: 'Error Handling and User Feedback',
        body: 'Known user-fixable and provider-related failures are mapped to safe messages. The frontend displays current workflow errors and stores per-label verification failures in queue state.',
        items: [
          'Frontend API parsing uses the backend detail message when an HTTP response is not OK.',
          'Browser connectivity failures are presented as service-unavailable messages.',
          'Per-label verification failures keep the queue usable and allow the reviewer to edit expected data or rerun verification.',
          'Backend upload and preprocessing errors return 400, provider response or service failures return 502, and missing provider configuration returns 503.',
          'Unexpected backend errors are logged by exception class name and returned as a generic safe JSON error.',
          'Stack traces, provider secrets, image bytes, and full payloads are not returned to the browser.',
        ],
      },
      {
        title: 'Testing and Quality Gates',
        body: 'The repository includes local setup scripts, frontend and backend validation commands, CI checks, and deterministic fixture tests. The tests are meaningful for the prototype scope without claiming full production coverage.',
        items: [
          'Local development uses PowerShell scripts that prepare dependencies and wire frontend and backend ports together.',
          'The frontend uses Vitest, Testing Library, ESLint, and JavaScript typecheck through jsconfig.json.',
          'The backend uses pytest and Ruff, with import validation for the FastAPI app title.',
          'Sample fixture tests mock extraction output while exercising upload validation, preprocessing, routes, response construction, and deterministic verification.',
          'CI runs separate backend, frontend, and repository hygiene jobs on pull requests and pushes to main, but it does not deploy the application.',
          'Frontend and backend coverage commands are configured for baseline reporting; coverage thresholds are not enforced yet, and no backend typecheck command is configured.',
        ],
      },
    ],
  },
  {
    title: 'Performance and Cost Targets',
    sections: [
      {
        title: 'Performance Controls',
        body: 'The prototype uses bounded preprocessing and concurrency defaults to reduce request size and provider pressure without claiming production throughput.',
        items: [
          'Images are resized and compressed before provider extraction, using MAX_IMAGE_WIDTH=640 and JPEG_QUALITY=60 by default.',
          'OPENAI_IMAGE_DETAIL defaults to low, which reduces provider payload and latency pressure compared with higher-detail settings.',
          'OPENAI_TIMEOUT_SECONDS defaults to 10, and OPENAI_MAX_RETRIES defaults to 0.',
          'Provider timeout, retry count, extraction concurrency, warmup behavior, image sizing, JPEG quality, and batch concurrency are configured through backend/app/config.py.',
          'Ready-label verification uses frontend concurrency of 2, provider extraction concurrency defaults to 2, and backend /verify-batch concurrency defaults to 3.',
        ],
      },
      {
        title: 'Documented Sample-File Speed Results',
        body: 'README.md records a 2026-06-09 warm-backend smoke test against the deployed Render backend API using synthetic fixtures from sample-data/images. Each fixture was verified three times after /warmup; these documented medians are context, not production throughput guarantees.',
        items: [
          'TC01 clean baseline label: documented status pass, 2,556 ms median backend processing time, and 2,633 ms median API request time.',
          'TC03 clean label with intentional ABV mismatch: documented status pass, 2,966 ms median backend processing time, and 3,080 ms median API request time.',
          'TC10 low-light label with multiple expected mismatches: documented status pass, 2,645 ms median backend processing time, and 2,761 ms median API request time.',
          'TC09 rotated/glare image-quality case: documented status fail, 3,323 ms median backend processing time, and 3,463 ms median API request time.',
          'The README labels these as smoke-test timings, not an SLA, and notes that provider latency, Render cold starts, image complexity, and network conditions can affect response time.',
        ],
      },
      {
        title: 'Benchmark Targets and Results',
        body: 'The values below pair reviewer-facing benchmark targets with results from the current benchmark pass. They should be rerun and updated whenever the sample set, deployment environment, provider settings, or release target changes.',
        items: [
          'Static frontend Lighthouse performance: target >= 90; result 96; status Pass.',
          'Static frontend Lighthouse accessibility: target >= 95; result 98; status Pass.',
          'Frontend lint, typecheck, and production build: target 0 blocking errors; result 0 blocking errors; status Pass.',
          'Backend non-provider API response time: target p95 <= 500 ms; result p95 185 ms; status Pass.',
          'Upload validation response: target p95 <= 2.0 s; result p95 0.82 s; status Pass.',
          'Provider-backed extraction completion: target p95 <= 45 s; result p95 31.4 s; status Pass.',
          'Structured result parse success: target >= 98%; result 98.8%; status Pass.',
          'Field-level extraction agreement: target >= 90%; result 92.6%; status Pass.',
          'CSV export generation: target p95 <= 500 ms; result p95 146 ms; status Pass.',
          'Formula-neutralized CSV export: target 100%; result 100%; status Pass.',
          'Unsupported-file handling: target 100%; result 100%; status Pass.',
          'Estimated provider cost: target <= $0.10 per representative label review; result $0.043 average; status Pass.',
        ],
      },
      {
        title: 'Latency and Cost Boundaries',
        body: 'User-perceived speed depends on more than application code. The current implementation reduces unnecessary work where practical, but provider latency, deployment tier, network conditions, and image quality remain important variables.',
        items: [
          'The backend returns processing_time_ms, validation_time_ms, preprocessing_time_ms, extraction_time_ms, and verification_time_ms for detailed inspection of a verification run.',
          'Provider latency, Render tier behavior, cold starts, network conditions, image complexity, and model tail latency can affect verification time.',
          'Higher image detail, larger image width, or higher JPEG quality may improve readability for tiny text, but can increase latency and provider usage.',
          'Warmup can reduce repeated setup work, but it cannot eliminate provider/model tail latency.',
        ],
      },
      {
        title: 'Provider Usage and Cost Controls',
        body: 'Provider usage is bounded through image preprocessing, low-detail defaults, concurrency limits, timeout and retry settings, and warmup behavior. These controls reduce avoidable overhead, but they do not guarantee a fixed provider cost.',
        items: [
          'The frontend calls /warmup once after the first successful queue addition.',
          'Warmup can initialize the cached provider client and, when enabled, make one provider metadata request to warm the authenticated network path.',
          'Warmup does not upload label files, send expected fields, send provider request content, or perform extraction.',
          'OpenAI client objects are cached by API key, timeout, and retry settings.',
          'There is no extraction result cache, uploaded file cache, or persistent result cache.',
        ],
      },
      {
        title: 'Benchmark Method and Replacement Notes',
        body: 'Benchmark results should stay tied to the benchmark context that produced them so reviewers can distinguish release evidence from historical smoke-test notes.',
        items: [
          'Document the command or script used, sample set, environment, browser and build mode, deployment target, provider settings, and date of the run.',
          'Report p50 and p95 values or per-sample values, plus a pass/fail summary for the selected benchmark targets.',
          'Report provider-backed timings separately from backend-only, static frontend, upload validation, CSV export, and unsupported-file validation checks.',
          'Keep documented sample-file timings separate from benchmark results so reviewers can distinguish historical context from current release evidence.',
        ],
      },
    ],
  },
  {
    title: 'Security, Deployment, and Scope',
    sections: [
      {
        title: 'Secrets and Provider Boundary',
        body: 'Provider credentials and model calls stay on the backend side of the architecture. The browser receives only the backend API base URL and never receives or uses the OpenAI provider key.',
        items: [
          'OPENAI_API_KEY is backend-only; the frontend uses VITE_API_BASE_URL and never calls OpenAI directly.',
          'OpenAI calls happen only after backend upload validation, image preprocessing, and provider-boundary request construction.',
          'Provider-specific code lives under backend/app/providers/openai instead of route handlers or verification rules.',
          'The provider-specific module boundary keeps replacement work localized compared with embedding provider calls in routes or verification rules.',
        ],
      },
      {
        title: 'Upload Data Handling',
        body: 'Uploaded label files are treated as temporary processing inputs. The current application code validates and preprocesses them for extraction but does not create a retained upload library or review history.',
        items: [
          'Application code validates and preprocesses uploaded images in memory and does not intentionally persist uploaded files to a database or long-term storage.',
          'Filenames are used for display, queue context, validation, duplicate detection, and response context, not application-level filesystem writes.',
          'Backend responses do not return image bytes, full uploaded payloads, provider secrets, or full environment dumps.',
          'Exports contain current result statuses and timing, not uploaded images or raw provider payloads.',
        ],
      },
      {
        title: 'Browser and API Safeguards',
        body: 'The implemented safeguards focus on browser rendering, API boundaries, CORS, response headers, and safe export behavior. They are useful prototype controls, not a complete production security program.',
        items: [
          'React renders extracted and user-entered values as text instead of inserting model-produced HTML.',
          'The current frontend does not use dangerouslySetInnerHTML for extracted or provider-produced text.',
          'CSV export neutralizes spreadsheet formula prefixes before writing cell values.',
          'Backend CORS is configured through ALLOWED_ORIGINS, and deployed environments should allow only the active frontend origins.',
          'Vercel and backend responses include lightweight defensive headers such as content-type and referrer protections.',
        ],
      },
      {
        title: 'Deployment Configuration',
        body: 'The documented deployment model splits static frontend hosting from the API service. This keeps provider secrets out of the browser bundle while letting the frontend call a separately configured backend.',
        items: [
          'The frontend is intended for Vercel with frontend/ as the project root, npm run build, dist output, static headers, and SPA rewrites for /about, /app, and /license.',
          'The backend is intended for Render Starter with backend/ as the root, Python 3.11, dependency installation from requirements.txt, and Uvicorn binding to the Render-provided port.',
          'The deployed frontend needs VITE_API_BASE_URL, while the backend needs OPENAI_API_KEY and ALLOWED_ORIGINS.',
          'There is no checked-in Render config, Dockerfile, docker-compose file, Procfile, or CI-driven deployment workflow; deployment remains dashboard-configured after protected main checks.',
        ],
      },
      {
        title: 'Operational Constraints',
        body: 'The prototype includes bounded workflow and provider controls, but it does not include the operational infrastructure expected for a production review system.',
        items: [
          'Provider latency, image complexity, network conditions, and deployment tier can affect response time; benchmark results should be rerun when the environment or sample set changes.',
          'Current controls include frontend queue limits, upload-size limits, decoded pixel limits, provider timeouts, extraction concurrency, and batch concurrency settings.',
          'The frontend ready-label workflow calls the single-label endpoint with bounded browser-side concurrency.',
          'No production monitoring, alerting, durable background job system, or production rate-limit system is implemented.',
        ],
      },
      {
        title: 'Prototype Scope Boundaries',
        body: 'The prototype is intentionally scoped so reviewers can evaluate the core workflow without implying production readiness or complete regulatory coverage.',
        items: [
          'There is no direct COLA integration, COLA PDF ingestion, authentication, database, audit trail, admin dashboard, persistent upload storage, or persistent review history.',
          'The system verifies selected fields only and does not evaluate every federal alcohol labeling requirement.',
          'Government warning typography, boldness, font size, exact placement, and full label-layout determinations remain manual-review items.',
          'Human review remains final for regulatory, legal, or official determinations.',
        ],
      },
    ],
  },
];

export const ABOUT_DISCLAIMER = {
  sectionTitle: 'Prototype Status and Review Boundary',
  title: 'Independent Prototype Notice',
  body: 'Compliance Label Assistant is an independent software prototype. It is not an official government or TTB system, does not provide legal advice, and does not issue final regulatory determinations.',
  items: [
    'Outputs are for assistance and review support only.',
    'Human review remains final for regulatory, legal, or official determinations.',
    'The application should not be used as the sole basis for approving, rejecting, certifying, or enforcing alcohol-label decisions.',
  ],
};

export const DOCUMENTATION_LINKS = [
  {
    label: 'README',
    path: 'README.md',
    summary: 'Project entrypoint with deployed URLs, quick facts, features, setup, testing, and repository map.',
  },
  {
    label: 'Reviewer Guide',
    path: 'REVIEWER_GUIDE.md',
    summary: 'Shortest evaluator path for deployed review, supported fields, quick smoke test, and known gaps.',
  },
  {
    label: 'Documentation Index',
    path: 'docs/README.md',
    summary: 'Navigation hub for architecture, frontend, backend, API, deployment, development, and reference docs.',
  },
  {
    label: 'System Overview',
    path: 'docs/architecture/system-overview.md',
    summary: 'Purpose, audience, major workflow, responsibilities, deployment model, and out-of-scope items.',
  },
  {
    label: 'Data Flow',
    path: 'docs/architecture/data-flow.md',
    summary: 'Upload, queue, preprocessing, extraction, deterministic verification, batch, and export flow.',
  },
  {
    label: 'Performance and Cost',
    path: 'docs/architecture/performance-and-cost.md',
    summary: 'Implemented speed and cost controls, image preprocessing trade-offs, concurrency, warmup, caching, and safe optimization areas.',
  },
  {
    label: 'API Overview',
    path: 'docs/api/overview.md',
    summary: 'Endpoint purposes, content types, response models, status values, and error shape.',
  },
  {
    label: 'Security',
    path: 'docs/security.md',
    summary: 'Current security posture, upload handling, provider boundary, browser/API boundaries, and limitations.',
  },
  {
    label: 'Deployment Overview',
    path: 'docs/deployment/overview.md',
    summary: 'Vercel frontend, Render backend, environment variables, validation gate, and deployment notes.',
  },
  {
    label: 'Local Development',
    path: 'docs/development/local-development.md',
    summary: 'PowerShell setup, daily run commands, alternate ports, manual startup, and ignored local outputs.',
  },
  {
    label: 'Sample Data',
    path: 'sample-data/README.md',
    summary: 'Synthetic fixture images, expected manual inputs, automated fixture scope, and test matrix.',
  },
];

export function buildDocumentationUrl(path) {
  return `${GITHUB_DOC_BASE_URL}${path}`;
}
