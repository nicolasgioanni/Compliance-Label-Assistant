import AppShell from './components/shared/AppShell';
import { useServiceHealth } from './hooks/useServiceHealth';
import AboutPage from './pages/AboutPage';
import LandingPage from './pages/LandingPage';
import LicensePage from './pages/LicensePage';
import ToolPage from './pages/ToolPage';

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
  if (typeof window === 'undefined') {
    return '/';
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/about' || pathname === '/app' || pathname === '/license') {
    return pathname;
  }

  return '/';
}

function getStaticPage(activePath) {
  if (activePath === '/about') {
    return <AboutPage />;
  }

  if (activePath === '/license') {
    return <LicensePage />;
  }

  return <LandingPage />;
}
