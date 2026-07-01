// Owns the lightweight pathname switch used instead of a routing library.
import AppShell from './components/shared/AppShell';
import { useServiceHealth } from './hooks/useServiceHealth';
import AboutPage from './pages/AboutPage';
import LandingPage from './pages/LandingPage';
import LicensePage from './pages/LicensePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import ToolPage from './pages/ToolPage';

const ROUTE_PATHS = new Set(['/', '/about', '/app', '/license', '/privacy', '/terms']);

export default function App() {
  const activePath = getActivePath();
  const isToolPath = activePath === '/app';
  const serviceHealth = useServiceHealth();

  return (
    <AppShell activePath={activePath} serviceStatus={serviceHealth.status}>
      {isToolPath ? <ToolPage serviceErrorMessage={serviceHealth.errorMessage} /> : getStaticPage(activePath)}
    </AppShell>
  );
}

function getActivePath() {
  // Vercel rewrites these direct-visit paths to index.html, then this client
  // switch decides which page module to show.
  if (typeof window === 'undefined') {
    return '/';
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  if (ROUTE_PATHS.has(pathname)) {
    return pathname;
  }

  return '/';
}

function getStaticPage(activePath) {
  // Legal and license pages stay footer-linked while the primary navigation
  // remains focused on Home, About, and Verification Tool.
  if (activePath === '/about') {
    return <AboutPage />;
  }

  if (activePath === '/license') {
    return <LicensePage />;
  }

  if (activePath === '/privacy') {
    return <PrivacyPolicyPage />;
  }

  if (activePath === '/terms') {
    return <TermsOfUsePage />;
  }

  return <LandingPage />;
}
