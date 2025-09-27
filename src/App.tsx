import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { DashboardLayout } from './components/dashboard-layout';
import { LoginForm } from './components/login-form';
import { ProtectedRoute } from './components/protected-route';
import Dashboard from './pages/dashboard';
import EntitlementsPage from './pages/entitlements';
import LicenseDetailPage from './pages/license-detail';
import LicensesPage from './pages/licenses';
import MachinesPage from './pages/machines';
import PoliciesPage from './pages/policies';
import PolicyDetailPage from './pages/policy-detail';
import ProductDetailPage from './pages/product-detail';
import ProductsPage from './pages/products';
import TokensPage from './pages/tokens';
import UserDetailPage from './pages/user-detail';
import UsersPage from './pages/users';

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/users" element={
          <ProtectedRoute>
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/users/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/products" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/products/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/licenses" element={
          <ProtectedRoute>
            <DashboardLayout>
              <LicensesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/licenses/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <LicenseDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/machines" element={
          <ProtectedRoute>
            <DashboardLayout>
              <MachinesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/policies" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PoliciesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/policies/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PolicyDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/tokens" element={
          <ProtectedRoute>
            <DashboardLayout>
              <TokensPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/entitlements" element={
          <ProtectedRoute>
            <DashboardLayout>
              <EntitlementsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;