// App shell tests protect route selection, footer/legal links, and health status behavior.
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

  it('keeps shared chrome outside the route-keyed body transition', async () => {
    const { container, rerender } = renderAt('/');
    const bodyTransition = container.querySelector('.page-body-transition');

    expect(bodyTransition).toBeInTheDocument();
    expect(within(bodyTransition).getByRole('heading', { name: 'Compliance Label Assistant' })).toBeInTheDocument();
    expect(bodyTransition.contains(screen.getByRole('banner'))).toBe(false);
    expect(bodyTransition.contains(screen.getByRole('contentinfo'))).toBe(false);

    window.history.pushState({}, '', '/app');
    rerender(<App />);

    const nextBodyTransition = container.querySelector('.page-body-transition');

    expect(nextBodyTransition).toBeInTheDocument();
    expect(nextBodyTransition).not.toBe(bodyTransition);
    expect(within(nextBodyTransition).getByRole('heading', { name: 'Verification tool content' })).toBeInTheDocument();
    expect(nextBodyTransition.contains(screen.getByRole('banner'))).toBe(false);
    expect(nextBodyTransition.contains(screen.getByRole('contentinfo'))).toBe(false);

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
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
    expect(within(primaryNav).queryByRole('link', { name: 'Privacy Policy' })).not.toBeInTheDocument();
    expect(within(primaryNav).queryByRole('link', { name: 'Terms of Use' })).not.toBeInTheDocument();
    expect(within(primaryNav).queryByRole('link', { name: 'License' })).not.toBeInTheDocument();
    expect(within(primaryNav).queryByRole('link', { name: 'Source Code' })).not.toBeInTheDocument();
    expect(screen.getByText('Checking Status')).toBeInTheDocument();
    expectSharedFooter();

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('System Online')).toBeInTheDocument();
    expect(warmVerificationBackend).not.toHaveBeenCalled();
    expect(verifySingleLabel).not.toHaveBeenCalled();
  });

  it('falls back to the landing page for unknown deep links', async () => {
    renderAt('/unexpected/path');

    expect(screen.getByRole('heading', { name: 'Compliance Label Assistant' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Product Purpose And Role' })).toBeInTheDocument();

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).not.toHaveAttribute('aria-current');

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
    expect(warmVerificationBackend).not.toHaveBeenCalled();
    expect(verifySingleLabel).not.toHaveBeenCalled();
  });

  it('renders the about page with documentation links and live header status', async () => {
    const { container } = renderAt('/about');

    const levelOneHeadings = screen.getAllByRole('heading', { level: 1 });
    expect(levelOneHeadings).toHaveLength(1);
    expect(levelOneHeadings[0]).toHaveTextContent('About');
    expect(screen.getByText('PROJECT OVERVIEW')).toBeInTheDocument();
    expect(
      screen.getByText(/project purpose, reviewer workflow, architecture, quality controls, scope limits/i),
    ).toBeInTheDocument();
    expect(container.querySelector('.static-page__panel > .static-page__scroll')).toBeInTheDocument();
    expect(container.querySelector('.static-page__header + .about-section-group')).toBeInTheDocument();
    expect(container.querySelector('.about-page .static-page__panel')).not.toHaveClass('landing-info-panel');

    expect(screen.getByRole('heading', { name: 'Project and Workflow' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Architecture and Quality' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Performance and Cost' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Prototype Scope and Limitations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Documentation' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Technical Architecture' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Implementation and Quality' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Performance and Cost Targets' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Security, Deployment, and Scope' })).not.toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Project Overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reviewer Workflow' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Implemented Review Features' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Frontend Shell and Routing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Upload Validation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Deterministic Verification Rules' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Testing and Quality Gates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Performance Controls' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Provider Usage and Cost Controls' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Secrets and Provider Boundary' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'No Persistent Upload Storage' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Independent Prototype Notice' })).toBeInTheDocument();
    expect(screen.getByText('The browser queue supports up to 10 label images and tracks expected data per label.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'CSV and XLSX exports include current verification statuses and processing time, not raw extracted text.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('The provider call uses store=false and temperature 0 in the current OpenAI integration.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Application code validates and preprocesses uploaded images in memory and does not intentionally persist uploaded files to a database or long-term storage.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('No production monitoring, alerting, durable background job system, or production rate-limit system is implemented.')).toBeInTheDocument();
    expect(screen.getByText('There is no direct COLA integration, COLA PDF ingestion, authentication, database, audit trail, admin dashboard, persistent upload storage, or persistent review history.')).toBeInTheDocument();
    expect(screen.getByText('Outputs are for assistance and review support only.')).toBeInTheDocument();
    expect(screen.getAllByText('Human review remains final for regulatory, legal, or official determinations.').length)
      .toBeGreaterThan(0);
    expect(
      screen.getByText(
        'Compliance Label Assistant is an independent software prototype. It is not an official government or TTB system, does not provide legal advice, and does not issue final regulatory determinations.',
      ),
    ).toBeInTheDocument();

    const documentationSection = screen.getByRole('heading', { name: 'Documentation' }).closest('section');
    expect(documentationSection).toHaveClass('about-docs-group');
    expectAboutDocLink(documentationSection, /^README\s+README\.md/i, 'README.md');
    expectAboutDocLink(documentationSection, /Reviewer Guide\s+REVIEWER_GUIDE\.md/i, 'REVIEWER_GUIDE.md');
    expectAboutDocLink(
      documentationSection,
      /Performance and Cost\s+docs\/architecture\/performance-and-cost\.md/i,
      'docs/architecture/performance-and-cost.md',
    );
    expectAboutDocLink(
      documentationSection,
      /Deployment Overview\s+docs\/deployment\/overview\.md/i,
      'docs/deployment/overview.md',
    );
    expectAboutDocLink(documentationSection, /Sample Data\s+sample-data\/README\.md/i, 'sample-data/README.md');

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).queryByRole('link', { name: 'Privacy Policy' })).not.toBeInTheDocument();
    expect(within(primaryNav).queryByRole('link', { name: 'Terms of Use' })).not.toBeInTheDocument();
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

  it('shows backend health error detail on /app when health returns a user-facing error', async () => {
    checkHealth.mockRejectedValueOnce(new Error('Backend maintenance window.'));

    renderAt('/app');

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('System Offline')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Backend maintenance window.');
  });

  it('keeps the /app notification behavior when newer messages replace older banners', async () => {
    const { container } = renderAt('/app');

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Show edit warning' }));

    const bodyTransition = container.querySelector('.page-body-transition');
    const bannerLayer = document.body.querySelector('.error-banner-layer');

    expect(bannerLayer).toBeInTheDocument();
    expect(bannerLayer.parentElement).toBe(document.body);
    expect(bodyTransition).not.toContainElement(bannerLayer);
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

    const levelOneHeadings = screen.getAllByRole('heading', { level: 1 });
    expect(levelOneHeadings).toHaveLength(1);
    expect(levelOneHeadings[0]).toHaveTextContent('License');
    expect(screen.getByText('OPEN SOURCE LICENSE')).toBeInTheDocument();
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
    const disclaimer = container.querySelector('.static-page__disclaimer');
    expect(disclaimer).toHaveTextContent('Disclaimer:');
    expect(disclaimer).toHaveTextContent(
      'This summary is not the official license file, not the official Apache license page, and not legal advice. Always review the repository LICENSE file and the official Apache Software Foundation license text before relying on these terms.',
    );
    expect(container.querySelector('.license-page .static-page__header .static-page__divider')).toBeInTheDocument();

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
    expect(licenseActions.previousElementSibling).toHaveClass('static-page__panel');
    expect(container.querySelector('.license-page .static-page__panel > .static-page__scroll')).toBeInTheDocument();
    expect(githubLicenseLink.closest('.static-page__panel')).toBeNull();
    expect(officialLicenseLink.closest('.static-page__panel')).toBeNull();

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

  it('renders the privacy policy page with the shared shell and health check', async () => {
    renderAt('/privacy');

    const levelOneHeadings = screen.getAllByRole('heading', { level: 1 });
    expect(levelOneHeadings).toHaveLength(1);
    expect(levelOneHeadings[0]).toHaveTextContent('Privacy Policy');
    expect(screen.getByText('Effective date: June 28, 2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI Use Disclosure' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Data Practices Summary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Third-Party Provider Processing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Privacy Rights Note' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Children' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Changes' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Data Category' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Uploaded label images' })).toBeInTheDocument();
    expect(screen.getByText('No analytics or tracking library is included in current application code')).toBeInTheDocument();

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).queryByRole('link', { name: 'Privacy Policy' })).not.toBeInTheDocument();
    expect(within(primaryNav).queryByRole('link', { name: 'Terms of Use' })).not.toBeInTheDocument();
    expectSharedFooter();

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('System Online')).toBeInTheDocument();
    expect(warmVerificationBackend).not.toHaveBeenCalled();
    expect(verifySingleLabel).not.toHaveBeenCalled();
  });

  it('renders the terms of use page with user-submission language and no tool API calls', async () => {
    renderAt('/terms');

    const levelOneHeadings = screen.getAllByRole('heading', { level: 1 });
    expect(levelOneHeadings).toHaveLength(1);
    expect(levelOneHeadings[0]).toHaveTextContent('Terms of Use');
    expect(screen.getByText('Effective date: June 28, 2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'User Submissions and Uploaded Content' })).toBeInTheDocument();
    expect(screen.getByText('The project does not claim ownership of uploaded content.', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dispute Terms / Legal Review Placeholder' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Copyright Contact' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Changes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByText('No detailed mandatory arbitration or class-action waiver is included for this take-home prototype.', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('This prototype does not operate as a public user-content hosting platform.', { exact: false })).toBeInTheDocument();

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).queryByRole('link', { name: 'Privacy Policy' })).not.toBeInTheDocument();
    expect(within(primaryNav).queryByRole('link', { name: 'Terms of Use' })).not.toBeInTheDocument();
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
  expect(within(footer).getByText('Independent prototype • v2.0.0')).toBeInTheDocument();
  expect(within(footer).getByText(FOOTER_DISCLAIMER)).toBeInTheDocument();
  expect(within(footer).getByText(FOOTER_COPYRIGHT)).toBeInTheDocument();

  const footerNavigation = within(footer).getByRole('navigation', { name: 'Footer navigation' });
  const projectGroup = within(footerNavigation).getByRole('heading', { name: 'Project' }).closest('.app-footer__link-group');
  const legalGroup = within(footerNavigation).getByRole('heading', { name: 'Legal' }).closest('.app-footer__link-group');
  const sourceCodeLink = within(projectGroup).getByRole('link', { name: 'Source Code' });

  expect(projectGroup).toBeInTheDocument();
  expect(legalGroup).toBeInTheDocument();
  expect(within(projectGroup).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  expect(within(projectGroup).getByRole('link', { name: 'Verification Tool' })).toHaveAttribute('href', '/app');
  expect(sourceCodeLink).toHaveAttribute('href', 'https://github.com/nicolasgioanni/label-compliance-verifier');
  expect(sourceCodeLink).toHaveAttribute('target', '_blank');
  expect(sourceCodeLink).toHaveAttribute('rel', 'noreferrer noopener');
  expect(within(legalGroup).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
  expect(within(legalGroup).getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms');
  expect(within(legalGroup).getByRole('link', { name: 'License' })).toHaveAttribute('href', '/license');
}
