import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { PageFallback } from '@/components/layout/PageFallback';

// Lazy-load every route so the initial bundle stays small.
const LoginPage        = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage    = lazy(() => import('@/features/dashboard/DashboardPage'));
const RequestsPage     = lazy(() => import('@/features/requests/RequestsPage'));
const SettlementsPage  = lazy(() => import('@/features/settlements/SettlementsPage'));
const AliasesPage      = lazy(() => import('@/features/aliases/AliasesPage'));
const BankAccountsPage = lazy(() => import('@/features/accounts/BankAccountsPage'));
const SettingsPage     = lazy(() => import('@/features/settings/SettingsPage'));
const AuditPage        = lazy(() => import('@/features/audit/AuditPage'));
const SystemHealthPage = lazy(() => import('@/features/system/SystemHealthPage'));
const ApiClientsPage   = lazy(() => import('@/features/clients/ApiClientsPage'));
const NotFoundPage     = lazy(() => import('@/features/misc/NotFoundPage'));

/** Provides router-aware auth context to the entire tree. */
function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

/** Gate that pushes unauthenticated visitors to the login screen. */
function RequireAuth() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RoleGate({ allow, children }: { allow: 'user' | 'admin'; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allow) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true,                element: <Suspense fallback={<PageFallback />}><DashboardPage /></Suspense> },
          { path: 'requests',           element: <Suspense fallback={<PageFallback />}><RequestsPage /></Suspense> },
          { path: 'requests/:rtpId',    element: <Suspense fallback={<PageFallback />}><RequestsPage /></Suspense> },
          { path: 'settlements',        element: <Suspense fallback={<PageFallback />}><SettlementsPage /></Suspense> },
          { path: 'aliases',            element: <Suspense fallback={<PageFallback />}><AliasesPage /></Suspense> },
          { path: 'accounts',           element: <Suspense fallback={<PageFallback />}><BankAccountsPage /></Suspense> },
          { path: 'settings/*',         element: <Suspense fallback={<PageFallback />}><SettingsPage /></Suspense> },
          // Admin-only
          { path: 'system',  element: <RoleGate allow="admin"><Suspense fallback={<PageFallback />}><SystemHealthPage /></Suspense></RoleGate> },
          { path: 'clients', element: <RoleGate allow="admin"><Suspense fallback={<PageFallback />}><ApiClientsPage /></Suspense></RoleGate> },
          { path: 'audit',   element: <RoleGate allow="admin"><Suspense fallback={<PageFallback />}><AuditPage /></Suspense></RoleGate> },
          // Fallback
          { path: '*', element: <Suspense fallback={<PageFallback />}><NotFoundPage /></Suspense> },
        ],
      },
    ],
  },
  ],
  },
]);
