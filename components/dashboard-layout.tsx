'use client';

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardNav } from './dashboard-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/');
      return;
    }

    // Set token in API client
    apiClient.setToken(token);
  }, [isAuthenticated, token, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <DashboardNav />
      <main className="flex-1 md:pl-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}