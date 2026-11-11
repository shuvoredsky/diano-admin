'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { StoreProvider } from '@/store/provider';
import { SessionBootstrapProvider } from '@/features/auth/components/session-bootstrap-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <StoreProvider>
        <QueryProvider>
          <SessionBootstrapProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </SessionBootstrapProvider>
        </QueryProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
