'use client';

import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardNav } from './dashboard-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for hydration to complete
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated || !token) {
      router.replace('/');
      return;
    }
    // Set token in API client
   apiClient.setToken(token);
  }, [isAuthenticated, token, router, isInitialized]);

  // Show loading during hydration or if not authenticated
  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
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