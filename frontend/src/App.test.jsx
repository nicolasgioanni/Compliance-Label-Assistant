import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkHealth, verifySingleLabel, warmVerificationBackend } from './api/verificationApi';
import App from './App';
import { SERVICE_UNAVAILABLE_MESSAGE } from './constants/notificationMessages';

const GITHUB_DOC_BASE_URL = 'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/';
const FOOTER_DISCLAIMER =
  'Independent software prototype. Not an official TTB, Treasury, or government system. AI-assisted verification results require human review and are not legal or regulatory advice.';
const FOOTER_COPYRIGHT = '© 2026 Nicolas Gioanni. Licensed under Apache License 2.0.';

vi.mock('./api/verificationApi', () => ({
  checkHealth: vi.fn(),
  warmVerificationBackend: vi.fn(),
  verifySingleLabel: vi.fn(),
}));

vi.mock('./components/verification/VerificationForm', () => ({
  default: ({ showError }) => (
    <section aria-label="Verification tool content">
      <h2>Verification tool content</h2>
      <button
        type="button"
        onClick={() =>
          showError('Changing selected label data will mark the previous verification result stale.', {
            tone: 'warning',
          })
        }
      >
        Show edit warning
      </button>
      <button
        type="button"
        onClick={() => showError('Previous verification result is stale. Re-run verification to refresh it.')}
      >
        Show stale error
      </button>
    </section>
  ),
}));

describe('App routes and shared layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkHealth.mockResolvedValue({ status: 'ok' });
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the landing page at root with live header status and no tool API calls', async () => {
    const { container } = renderAt('/');
    const landingIntro = container.querySelector('.landing-info-panel__intro');
    const landingTitle = within(landingIntro).getByRole('heading', { name: 'Compliance Label Assistant' });
    const landingSubtitle = landingTitle.nextElementSibling;

    expect(landingTitle).toBeInTheDocument();
    expect(landingSubtitle).toHaveClass('static-page__subtitle');
    expect(landingSubtitle).toHaveTextContent('AI-assisted alcohol label verification');
    expect(screen.getAllByText('AI-assisted alcohol label verification')).toHaveLength(2);
    expect(
      screen.getByText(
        'Upload label artwork, enter expected application data, and generate a field-by-field verification report.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Product Purpose And Role' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Verification Capabilities' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Intended Review Audience' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Supported Label Coverage' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Queue-Based Review Workflow' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Performance And Responsiveness' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Prototype Scope And Limitations' })).toBeInTheDocument();
    const documentationSection = screen
      .getByRole('heading', { name: 'Architecture And Documentation' })
      .closest('section');

    expect(documentationSection).toBeInTheDocument();
    expect(screen.getByText('Designed to support, not replace, human review')).toBeInTheDocument();
    expect(screen.getByText('Exports current results to CSV or XLSX')).toBeInTheDocument();
    expect(screen.getByText('Alcohol content, including ABV and proof')).toBeInTheDocument();
    expect(screen.getByText('Clean baseline: 2,556 ms median backend processing')).toBeInTheDocument();
    expect(screen.getByText('These are observations, not an SLA.', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Human review remains final')).toBeInTheDocument();
    expect(screen.getByText('Not production-hardened for government or restricted-network use')).toBeInTheDocument();
    expect(documentationSection).toHaveTextContent(
      'The About page gives a short in-app summary. The system overview explains the full review workflow, and the architecture documentation breaks down the frontend, backend, extraction, and verification boundaries.',
    );
    expectLandingDocLink(documentationSection, 'About page', '/about', { external: false });
    expectLandingDocLink(documentationSection, 'system overview', 'docs/architecture/system-overview.md');
    expectLandingDocLink(documentationSection, 'architecture documentation', 'docs/architecture.md');
    expect(documentationSection).toHaveTextContent(
      'Use the frontend architecture guide for page structure, queue state, API client behavior, and export flow.',
    );
    expect(documentationSection).toHaveTextContent(
      'Use the backend architecture guide for routes, services, upload validation, preprocessing, provider access, and verification rules.',
    );
    expect(documentationSection).toHaveTextContent(
      'Use the data flow guide for request flow, extraction, comparison, result evidence, and export handoff.',
    );
    expect(documentationSection).toHaveTextContent(
      'Use the API overview for endpoint purpose, request formats, response models, status values, and error shape.',
    );
    expect(documentationSection).toHaveTextContent(
      'Use the deployment overview for Vercel, Render, environment variables, and production validation notes.',
    );
    expectLandingDocLink(documentationSection, 'frontend architecture guide', 'docs/architecture/frontend-architecture.md');
    expectLandingDocLink(documentationSection, 'backend architecture guide', 'docs/architecture/backend-architecture.md');
    expectLandingDocLink(documentationSection, 'data flow guide', 'docs/architecture/data-flow.md');
    expectLandingDocLink(documentationSection, 'API overview', 'docs/api/overview.md');
    expectLandingDocLink(documentationSection, 'deployment overview', 'docs/deployment/overview.md');
    expect(screen.queryByRole('link', { name: 'Open About Page' })).not.toBeInTheDocument();
    const aboutLinks = screen.getAllByRole('link', { name: 'About' });
    expect(aboutLinks.some((link) => link.getAttribute('href') === '/about')).toBe(true);
    expect(screen.queryByText(/Architecture and implementation notes are available/i)).not.toBeInTheDocument();

    const actionPanel = screen.getByRole('complementary', { name: 'Get Started' });
    expect(within(actionPanel).getByRole('heading', { name: 'Get Started' })).toBeInTheDocument();
    expect(
      within(actionPanel).getByText('Choose how you want to learn about the workflow or move directly into the app.'),
    ).toBeInTheDocument();
    expect(within(actionPanel).getByRole('link', { name: 'Verify Labels' })).toHaveAttribute('href', '/app');
    const sourceLink = within(actionPanel).getByRole('link', { name: 'Source Code' });
    expect(sourceLink).toHaveAttribute('href', 'https://github.com/nicolasgioanni/label-compliance-verifier');
    expect(sourceLink).toHaveClass('primary-button');
    expect(actionPanel).toHaveTextContent('Want to understand the software architecture?');
    expect(within(actionPanel).getByRole('link', { name: 'Read about CLA' })).toHaveAttribute(
      'href',
      '/about',
    );
    expect(screen.queryByText('Start Review')).not.toBeInTheDocument();
    expect(screen.queryByText('No account required')).not.toBeInTheDocument();

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(within(primaryNav).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('Checking Status')).toBeInTheDocument();
    expectSharedFooter();

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('System Online')).toBeInTheDocument();
    expect(warmVerificationBackend).not.toHaveBeenCalled();
    expect(verifySingleLabel).not.toHaveBeenCalled();
  });

  it('renders the about page with documentation links and live header status', async () => {
    const { container } = renderAt('/about');

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByText('Architecture and Implementation Notes')).toBeInTheDocument();
    expect(
      screen.getByText(
        /project purpose, reviewer workflow, frontend and backend architecture, implementation decisions/i,
      ),
    ).toBeInTheDocument();
    expect(container.querySelector('.about-page__panel > .about-page__scroll')).toBeInTheDocument();
    expect(container.querySelector('.about-page__hero + .about-section-group')).toBeInTheDocument();
    expect(container.querySelector('.about-page__panel')).not.toHaveClass('landing-info-panel');

    expect(screen.getByRole('heading', { name: 'Project and Workflow' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Project Overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reviewer Workflow' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Implemented Review Features' })).toBeInTheDocument();
    expect(screen.getByText('The browser queue supports up to 10 label images and tracks expected data per label.')).toBeInTheDocument();
    expect(screen.getByText('CSV and XLSX exports include current verification statuses and processing time, not raw extracted text.')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Technical Architecture' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Frontend Shell and Routing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Queue State Architecture' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Backend Service Boundaries' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Provider and Configuration Boundary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'API and Data Flow' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Repository and Deployment Structure' })).toBeInTheDocument();
    expect(screen.getByText('There is no React Router, server-side rendering, or frontend-hosted backend route layer in the current implementation.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'useQueueVerification owns selected-label verification, ready-label verification, in-flight locking, and per-label error application.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The OpenAI client factory caches clients by API key, timeout, and retry settings.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The provider-specific module boundary keeps extraction separate from deterministic comparison rules, which makes future OCR or vision-provider replacement more contained.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Implementation and Quality' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Upload Validation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Image Preprocessing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Extraction Pipeline' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Deterministic Verification Rules' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Error Handling and User Feedback' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Testing and Quality Gates' })).toBeInTheDocument();
    expect(screen.getByText('Queue planning also filters duplicate basenames and files beyond the 10-label queue limit.')).toBeInTheDocument();
    expect(screen.getByText('The provider call uses store=false and temperature 0 in the current OpenAI integration.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Government warning verification checks extracted text for a GOVERNMENT WARNING heading prefix and compares wording against the backend-owned standard warning.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'No frontend coverage, backend coverage, or backend typecheck command is configured in the current repository.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Performance and Cost Targets' })).toBeInTheDocument();
    const performanceSection = screen
      .getByRole('heading', { name: 'Performance and Cost Targets' })
      .closest('section');
    expect(within(performanceSection).getByRole('heading', { name: 'Performance Controls' })).toBeInTheDocument();
    expect(
      within(performanceSection).getByRole('heading', { name: 'Documented Sample-File Speed Results' }),
    ).toBeInTheDocument();
    expect(
      within(performanceSection).getByRole('heading', { name: 'Benchmark Targets and Results' }),
    ).toBeInTheDocument();
    expect(
      within(performanceSection).getByRole('heading', { name: 'Latency and Cost Boundaries' }),
    ).toBeInTheDocument();
    expect(
      within(performanceSection).getByRole('heading', { name: 'Provider Usage and Cost Controls' }),
    ).toBeInTheDocument();
    expect(
      within(performanceSection).getByRole('heading', { name: 'Benchmark Method and Replacement Notes' }),
    ).toBeInTheDocument();
    expect(performanceSection).toHaveTextContent(
      'Images are resized and compressed before provider extraction, using MAX_IMAGE_WIDTH=640 and JPEG_QUALITY=60 by default.',
    );
    expect(performanceSection).toHaveTextContent(
      'OPENAI_TIMEOUT_SECONDS defaults to 10, and OPENAI_MAX_RETRIES defaults to 0.',
    );
    const documentedSpeedCard = within(performanceSection)
      .getByRole('heading', { name: 'Documented Sample-File Speed Results' })
      .closest('article');
    expect(documentedSpeedCard).toHaveTextContent(
      'README.md records a 2026-06-09 warm-backend smoke test against the deployed Render backend API using synthetic fixtures from sample-data/images.',
    );
    expect(documentedSpeedCard).toHaveTextContent(
      'TC01 clean baseline label: documented status pass, 2,556 ms median backend processing time, and 2,633 ms median API request time.',
    );
    expect(documentedSpeedCard).toHaveTextContent(
      'TC03 clean label with intentional ABV mismatch: documented status pass, 2,966 ms median backend processing time, and 3,080 ms median API request time.',
    );
    expect(documentedSpeedCard).toHaveTextContent(
      'TC10 low-light label with multiple expected mismatches: documented status pass, 2,645 ms median backend processing time, and 2,761 ms median API request time.',
    );
    expect(documentedSpeedCard).toHaveTextContent(
      'TC09 rotated/glare image-quality case: documented status fail, 3,323 ms median backend processing time, and 3,463 ms median API request time.',
    );
    expect(documentedSpeedCard).toHaveTextContent(
      'The README labels these as smoke-test timings, not an SLA, and notes that provider latency, Render cold starts, image complexity, and network conditions can affect response time.',
    );
    const targetCard = within(performanceSection)
      .getByRole('heading', { name: 'Benchmark Targets and Results' })
      .closest('article');
    expect(performanceSection).toHaveTextContent(
      'The values below pair reviewer-facing benchmark targets with results from the current benchmark pass. They should be rerun and updated whenever the sample set, deployment environment, provider settings, or release target changes.',
    );
    expect(targetCard).toHaveTextContent(
      'Static frontend Lighthouse performance: target >= 90; result 96; status Pass.',
    );
    expect(targetCard).toHaveTextContent(
      'Backend non-provider API response time: target p95 <= 500 ms; result p95 185 ms; status Pass.',
    );
    expect(targetCard).toHaveTextContent(
      'Provider-backed extraction completion: target p95 <= 45 s; result p95 31.4 s; status Pass.',
    );
    expect(targetCard).toHaveTextContent(
      'Estimated provider cost: target <= $0.10 per representative label review; result $0.043 average; status Pass.',
    );
    expect(targetCard).not.toHaveTextContent('2,556 ms');
    expect(targetCard).not.toHaveTextContent('3,463 ms');
    expect(targetCard).not.toHaveTextContent('documented status');
    expect(targetCard).not.toHaveTextContent('placeholder');
    expect(targetCard).not.toHaveTextContent('example practice result');
    expect(targetCard).not.toHaveTextContent('actual result');
    const providerCostCard = within(performanceSection)
      .getByRole('heading', { name: 'Provider Usage and Cost Controls' })
      .closest('article');
    expect(providerCostCard).toHaveTextContent('The frontend calls /warmup once after the first successful queue addition.');
    expect(providerCostCard).toHaveTextContent(
      'OpenAI client objects are cached by API key, timeout, and retry settings.',
    );
    expect(providerCostCard).toHaveTextContent(
      'There is no extraction result cache, uploaded file cache, or persistent result cache.',
    );
    const benchmarkMethodCard = within(performanceSection)
      .getByRole('heading', { name: 'Benchmark Method and Replacement Notes' })
      .closest('article');
    expect(benchmarkMethodCard).toHaveTextContent(
      'Benchmark results should stay tied to the benchmark context that produced them so reviewers can distinguish release evidence from historical smoke-test notes.',
    );
    expect(benchmarkMethodCard).toHaveTextContent(
      'Document the command or script used, sample set, environment, browser and build mode, deployment target, provider settings, and date of the run.',
    );
    expect(benchmarkMethodCard).toHaveTextContent(
      'Report provider-backed timings separately from backend-only, static frontend, upload validation, CSV export, and unsupported-file validation checks.',
    );
    expect(performanceSection.nextElementSibling).toBe(
      screen.getByRole('heading', { name: 'Security, Deployment, and Scope' }).closest('section'),
    );

    expect(screen.getByRole('heading', { name: 'Security, Deployment, and Scope' })).toBeInTheDocument();
    const securitySection = screen
      .getByRole('heading', { name: 'Security, Deployment, and Scope' })
      .closest('section');
    expect(within(securitySection).getByRole('heading', { name: 'Secrets and Provider Boundary' })).toBeInTheDocument();
    expect(within(securitySection).getByRole('heading', { name: 'Upload Data Handling' })).toBeInTheDocument();
    expect(within(securitySection).getByRole('heading', { name: 'Browser and API Safeguards' })).toBeInTheDocument();
    expect(within(securitySection).getByRole('heading', { name: 'Deployment Configuration' })).toBeInTheDocument();
    expect(within(securitySection).getByRole('heading', { name: 'Operational Constraints' })).toBeInTheDocument();
    expect(within(securitySection).getByRole('heading', { name: 'Prototype Scope Boundaries' })).toBeInTheDocument();
    expect(within(securitySection).queryByRole('heading', { name: 'Prototype Status and Review Boundary' })).not.toBeInTheDocument();
    expect(screen.getByText('OPENAI_API_KEY is backend-only; the frontend uses VITE_API_BASE_URL and never calls OpenAI directly.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Application code validates and preprocesses uploaded images in memory and does not intentionally persist uploaded files to a database or long-term storage.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('The current frontend does not use dangerouslySetInnerHTML for extracted or provider-produced text.')).toBeInTheDocument();
    expect(screen.getByText('There is no checked-in Render config, Dockerfile, docker-compose file, Procfile, or CI-driven deployment workflow in the current repository.')).toBeInTheDocument();
    expect(screen.getByText('No production monitoring, alerting, durable background job system, or production rate-limit system is implemented.')).toBeInTheDocument();
    expect(screen.getByText('There is no direct COLA integration, COLA PDF ingestion, authentication, database, audit trail, admin dashboard, persistent upload storage, or persistent review history.')).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: 'Disclaimer' })).not.toBeInTheDocument();
    const disclaimerSection = screen
      .getByRole('heading', { name: 'Prototype Status and Review Boundary' })
      .closest('section');
    expect(disclaimerSection).toHaveClass('about-disclaimer-group');
    expect(within(disclaimerSection).getByRole('heading', { name: 'Independent Prototype Notice' })).toBeInTheDocument();
    const disclaimerCard = disclaimerSection.querySelector('.about-disclaimer');
    expect(disclaimerCard).toHaveTextContent(
      'Compliance Label Assistant is an independent software prototype. It is not an official government or TTB system, does not provide legal advice, and does not issue final regulatory determinations.',
    );
    expect(disclaimerCard).toHaveTextContent('Outputs are for assistance and review support only.');
    expect(disclaimerCard).toHaveTextContent(
      'Human review remains final for regulatory, legal, or official determinations.',
    );
    expect(disclaimerCard).toHaveTextContent(
      'The application should not be used as the sole basis for approving, rejecting, certifying, or enforcing alcohol-label decisions.',
    );

    const documentationSection = screen
      .getByRole('heading', { name: 'Repository Documentation' })
      .closest('section');
    expect(disclaimerSection.nextElementSibling).toBe(documentationSection);
    expect(documentationSection).toHaveClass('about-docs-group');
    expect(documentationSection).not.toHaveTextContent(
      'These repository documents are the source material behind this in-app summary.',
    );
    expect(documentationSection).not.toHaveTextContent(
      'The About page rewrites and organizes the key points for reviewers instead of duplicating the docs verbatim.',
    );
    expectAboutDocLink(documentationSection, /^README\s+README\.md/i, 'README.md');
    expectAboutDocLink(documentationSection, /Reviewer Guide\s+REVIEWER_GUIDE\.md/i, 'REVIEWER_GUIDE.md');
    expectAboutDocLink(documentationSection, /Documentation Index\s+docs\/README\.md/i, 'docs/README.md');
    expectAboutDocLink(documentationSection, /System Overview\s+docs\/architecture\/system-overview\.md/i, 'docs/architecture/system-overview.md');
    expectAboutDocLink(documentationSection, /Data Flow\s+docs\/architecture\/data-flow\.md/i, 'docs/architecture/data-flow.md');
    expectAboutDocLink(
      documentationSection,
      /Performance and Cost\s+docs\/architecture\/performance-and-cost\.md/i,
      'docs/architecture/performance-and-cost.md',
    );
    expectAboutDocLink(documentationSection, /API Overview\s+docs\/api\/overview\.md/i, 'docs/api/overview.md');
    expectAboutDocLink(documentationSection, /Security\s+docs\/security\.md/i, 'docs/security.md');
    expectAboutDocLink(documentationSection, /Deployment Overview\s+docs\/deployment\/overview\.md/i, 'docs/deployment/overview.md');
    expectAboutDocLink(documentationSection, /Local Development\s+docs\/development\/local-development\.md/i, 'docs/development/local-development.md');
    expectAboutDocLink(documentationSection, /Sample Data\s+sample-data\/README\.md/i, 'sample-data/README.md');

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).not.toHaveAttribute('aria-current');
    expectSharedFooter();

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('System Online')).toBeInTheDocument();
    expect(warmVerificationBackend).not.toHaveBeenCalled();
    expect(verifySingleLabel).not.toHaveBeenCalled();
  });

  it('renders the verification tool at /app with the shared shell and health check', async () => {
    renderAt('/app');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expectSharedFooter();
    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(primaryNav).toBeInTheDocument();
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(primaryNav).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('heading', { name: 'Verification tool content' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Verify Labels' })).not.toBeInTheDocument();
    expect(screen.getByText('Checking Status')).toBeInTheDocument();

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('System Online')).toBeInTheDocument();
  });

  it('shows the service-unavailable banner on /app when the shared health check fails', async () => {
    checkHealth.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderAt('/app');

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('System Offline')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(SERVICE_UNAVAILABLE_MESSAGE);
  });

  it('keeps the /app notification behavior when newer messages replace older banners', async () => {
    renderAt('/app');

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Show edit warning' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Changing selected label data will mark the previous verification result stale.',
    );
    expect(screen.getByRole('alert')).toHaveClass('error-banner-warning');

    fireEvent.click(screen.getByRole('button', { name: 'Show stale error' }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent('Previous verification result is stale. Re-run verification to refresh it.');
    expect(alerts[0]).toHaveClass('error-banner-error');
    expect(
      screen.queryByText('Changing selected label data will mark the previous verification result stale.'),
    ).not.toBeInTheDocument();
  });

  it('renders the license page with live header status and no tool API calls', async () => {
    const { container } = renderAt('/license');

    expect(screen.getByRole('heading', { name: 'License' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'This page summarizes the license information for Compliance Label Assistant and explains the major terms of the Apache License 2.0 in plain language.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Project License' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Allowed Uses' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Redistribution Duties' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Patent Grant' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trademarks' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Warranty And Liability' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contributions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Prototype Context' })).toBeInTheDocument();
    expect(screen.getByText('Use the software for personal, academic, internal, commercial, or evaluation purposes.')).toBeInTheDocument();
    expect(screen.getByText('Provide recipients with a copy of the Apache License 2.0.')).toBeInTheDocument();
    const disclaimer = container.querySelector('.license-page__disclaimer');
    expect(disclaimer).toHaveTextContent('Disclaimer:');
    expect(disclaimer).toHaveTextContent(
      'This summary is not the official license file, not the official Apache license page, and not legal advice. Always review the repository LICENSE file and the official Apache Software Foundation license text before relying on these terms.',
    );
    expect(container.querySelector('.license-page__intro + .license-page__divider')).toBeInTheDocument();

    const githubLicenseLink = screen.getByRole('link', { name: 'View LICENSE on GitHub' });
    expect(githubLicenseLink).toHaveAttribute(
      'href',
      'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/LICENSE',
    );
    expect(githubLicenseLink).toHaveAttribute('target', '_blank');
    expect(githubLicenseLink).toHaveAttribute('rel', 'noreferrer noopener');
    expect(githubLicenseLink).toHaveClass('primary-button');

    const officialLicenseLink = screen.getByRole('link', { name: 'View Official License Page' });
    expect(officialLicenseLink).toHaveAttribute('href', 'https://www.apache.org/licenses/LICENSE-2.0');
    expect(officialLicenseLink).toHaveAttribute('target', '_blank');
    expect(officialLicenseLink).toHaveAttribute('rel', 'noreferrer noopener');
    expect(officialLicenseLink).toHaveClass('primary-button');

    const licenseActions = screen.getByLabelText('License page actions');
    expect(licenseActions).toHaveClass('verification-actions');
    expect(licenseActions.previousElementSibling).toHaveClass('license-page__panel');
    expect(container.querySelector('.license-page__panel > .license-page__scroll')).toBeInTheDocument();
    expect(githubLicenseLink.closest('.license-page__panel')).toBeNull();
    expect(officialLicenseLink.closest('.license-page__panel')).toBeNull();

    expect(
      screen.queryByText('Independent prototype, not an official TTB system. Human review remains final.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('The repository LICENSE file is the source of truth for the full license text.'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Checking Status')).toBeInTheDocument();

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).not.toHaveAttribute('aria-current');
    expectSharedFooter();

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('System Online')).toBeInTheDocument();
    expect(warmVerificationBackend).not.toHaveBeenCalled();
    expect(verifySingleLabel).not.toHaveBeenCalled();
  });
});

function renderAt(pathname) {
  window.history.pushState({}, '', pathname);
  return render(<App />);
}

function expectLandingDocLink(section, label, href, { external = true } = {}) {
  const link = within(section).getByRole('link', { name: label });

  expect(link).toHaveAttribute('href', external ? `${GITHUB_DOC_BASE_URL}${href}` : href);

  if (external) {
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    return;
  }

  expect(link).not.toHaveAttribute('target');
  expect(link).not.toHaveAttribute('rel');
}

function expectAboutDocLink(section, name, href) {
  const link = within(section).getByRole('link', { name });

  expect(link).toHaveAttribute('href', `${GITHUB_DOC_BASE_URL}${href}`);
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noreferrer noopener');
}

function expectSharedFooter() {
  const footer = screen.getByRole('contentinfo');

  expect(within(footer).getByRole('img', { name: 'Compliance Label Assistant logo' })).toHaveAttribute(
    'src',
    '/cla-logo.png',
  );
  expect(within(footer).getByText('Compliance Label Assistant')).toBeInTheDocument();
  expect(within(footer).getByText('Independent prototype • v1.0.0')).toBeInTheDocument();
  expect(within(footer).getByText(FOOTER_DISCLAIMER)).toBeInTheDocument();
  expect(within(footer).getByText(FOOTER_COPYRIGHT)).toBeInTheDocument();

  const footerNavigation = within(footer).getByRole('navigation', { name: 'Footer navigation' });
  const sourceCodeLink = within(footerNavigation).getByRole('link', { name: 'Source Code' });

  expect(sourceCodeLink).toHaveAttribute('href', 'https://github.com/nicolasgioanni/label-compliance-verifier');
  expect(sourceCodeLink).toHaveAttribute('target', '_blank');
  expect(sourceCodeLink).toHaveAttribute('rel', 'noreferrer noopener');
  expect(within(footerNavigation).getByRole('link', { name: 'License' })).toHaveAttribute('href', '/license');
  expect(within(footerNavigation).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  expect(within(footerNavigation).getByRole('link', { name: 'Verification Tool' })).toHaveAttribute('href', '/app');
}
