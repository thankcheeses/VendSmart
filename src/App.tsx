import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { isDemoMode } from '@/lib/supabase';

import AppHeader from '@/components/layout/AppHeader';
import RightRail from '@/components/layout/RightRail';
import DemoBanner from '@/components/layout/DemoBanner';
import UpgradeBanner from '@/components/layout/UpgradeBanner';

import FleetOverview from '@/pages/FleetOverview';
import MachinesPage from '@/pages/MachinesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AlertsPage from '@/pages/AlertsPage';
import RestockMapPage from '@/pages/RestockMapPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

import { useMachines } from '@/hooks/useMachines';
import { useAlerts } from '@/hooks/useAlerts';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

const navToPath: Record<string, string> = {
  dashboard: '/',
  machines: '/machines',
  analytics: '/analytics',
  alerts: '/alerts',
  restock: '/restock',
  settings: '/settings',
};

const pathToNav: Record<string, string> = Object.fromEntries(
  Object.entries(navToPath).map(([k, v]) => [v, k])
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }} />;
  if (!isDemoMode && !user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DashboardShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { machines } = useMachines();
  const { alerts, acknowledgeAlert } = useAlerts();
  const metrics = useDashboardMetrics(machines, alerts);
  const { subscription } = useAuth();

  const activeNav = pathToNav[location.pathname] ?? 'dashboard';
  const unackAlerts = alerts.filter(a => !a.acknowledged).length;

  const handleNavChange = (nav: string) => {
    navigate(navToPath[nav] ?? '/');
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {isDemoMode && <DemoBanner />}
      {subscription && <UpgradeBanner machineCount={machines.length} machineLimit={subscription.machine_limit} />}
      <AppHeader
        activeNav={activeNav}
        onNavChange={handleNavChange}
        alertCount={unackAlerts}
        alerts={alerts}
        onAcknowledgeAlert={acknowledgeAlert}
      />

      <div
        style={{
          marginTop: isDemoMode || (subscription && machines.length >= subscription.machine_limit) ? 40 : 0,
          paddingTop: 56,
          paddingRight: 0,
        }}
        className="xl:pr-[288px]"
      >
        <main className="px-4 sm:px-6 py-6">
          <Routes>
            <Route path="/" element={<FleetOverview />} />
            <Route path="/machines" element={<MachinesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/restock" element={<RestockMapPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      <RightRail alerts={alerts} metrics={metrics} onNavChange={handleNavChange} />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const title = document.title;
    const nav = pathToNav[location.pathname];
    if (nav) document.title = `${nav.charAt(0).toUpperCase() + nav.slice(1)} — VendSmart`;
    else document.title = title;
  }, [location.pathname]);

  if (loading) return <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }} />;

  return (
    <Routes>
      <Route path="/login" element={isDemoMode || user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={isDemoMode || user ? <Navigate to="/" replace /> : <SignupPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
