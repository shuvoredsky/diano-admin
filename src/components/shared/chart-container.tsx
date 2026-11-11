'use client';

import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils/cn';

interface ChartContainerProps {
  children: ReactElement;
  height?: number;
  className?: string;
}

/**
 * Reusable Recharts ResponsiveContainer foundation for future analytics views.
 * Actual charts are deferred to Phase 2+.
 */
export function ChartContainer({ children, height = 320, className }: ChartContainerProps) {
  return (
    <div className={cn('w-full min-w-0', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

