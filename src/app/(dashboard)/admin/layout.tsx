'use client';

import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Topbar } from '@/components/layout/topbar';
import { AuthGate } from '@/features/auth/components/auth-gate';
import { useAppSelector } from '@/store/hooks';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);

  return (
    <AuthGate>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <MobileNav />
        <div
          className={`flex min-h-screen flex-col transition-all duration-300 ${
            isCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`}
        >
          <Topbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
