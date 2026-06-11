import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkHealth, verifySingleLabel, warmVerificationBackend } from './api/verificationApi';
import App from './App';
import { SERVICE_UNAVAILABLE_MESSAGE } from './constants/notificationMessages';

const GITHUB_DOC_BASE_URL = 'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/';

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

    await waitFor(() => {
      expect(checkHealth).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('System Online')).toBeInTheDocument();
    expect(warmVerificationBackend).not.toHaveBeenCalled();
    expect(verifySingleLabel).not.toHaveBeenCalled();
  });

  it('renders the about page with documentation links and live header status', async () => {
    renderAt('/about');

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'System Overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Frontend Architecture' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Backend Architecture' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Extraction And Verification Flow' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Security And Prototype Boundaries' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /docs\/architecture\/frontend-architecture\.md/i })).toHaveAttribute(
      'href',
      'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/docs/architecture/frontend-architecture.md',
    );
    expect(screen.getByRole('link', { name: /docs\/architecture\/backend-architecture\.md/i })).toHaveAttribute(
      'href',
      'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/docs/architecture/backend-architecture.md',
    );
    expect(
      screen.getByRole('link', { name: /docs\/architecture\/extraction-verification-flow\.md/i }),
    ).toHaveAttribute(
      'href',
      'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/docs/architecture/extraction-verification-flow.md',
    );
    expect(screen.getByRole('link', { name: /docs\/architecture\/data-flow\.md/i })).toHaveAttribute(
      'href',
      'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/docs/architecture/data-flow.md',
    );
    expect(screen.getByRole('link', { name: /docs\/api\/overview\.md/i })).toHaveAttribute(
      'href',
      'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/docs/api/overview.md',
    );
    expect(screen.getByRole('link', { name: /docs\/deployment\/overview\.md/i })).toHaveAttribute(
      'href',
      'https://github.com/nicolasgioanni/label-compliance-verifier/blob/main/docs/deployment/overview.md',
    );

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(within(primaryNav).getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(within(primaryNav).getByRole('link', { name: 'Verification Tool' })).not.toHaveAttribute('aria-current');

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
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
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
