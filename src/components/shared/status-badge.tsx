import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' | 'auto';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: string;
  label?: string;
  variant?: BadgeVariant;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  // Success
  DELIVERED: 'success',
  PAID: 'success',
  APPROVED: 'success',
  ACTIVE: 'success',
  PUBLISHED: 'success',
  COMPLETED: 'success',
  IN_STOCK: 'success',
  RESOLVED: 'success',
  SUCCESS: 'success',

  // Warning
  PENDING: 'warning',
  REQUESTED: 'warning',
  LOW_STOCK: 'warning',
  MEDIUM: 'warning',
  WARNING: 'warning',
  PARTIALLY_REFUNDED: 'warning',
  INSPECTED: 'warning',

  // Danger
  CANCELLED: 'danger',
  REJECTED: 'danger',
  FAILED: 'danger',
  OUT_OF_STOCK: 'danger',
  HIGH: 'danger',
  FLAGGED: 'danger',
  CRITICAL: 'danger',
  DEAD: 'danger',
  INACTIVE: 'danger',

  // Info
  PROCESSING: 'info',
  SHIPPED: 'info',
  CONFIRMED: 'info',
  PICKED_UP: 'info',
  IN_TRANSIT: 'info',
  LOW: 'info',
  INFO: 'info',

  // Purple
  REFUNDED: 'purple',
  RETURNED: 'purple',
  VIP: 'purple',
  SPECIAL: 'purple',

  // Neutral
  DRAFT: 'neutral',
  ARCHIVED: 'neutral',
  NONE: 'neutral',
};

export function StatusBadge({
  status,
  label,
  variant = 'auto',
  pulse = false,
  size = 'md',
  className,
  ...props
}: StatusBadgeProps) {
  const normalizedStatus = (status || '').toUpperCase().trim();
  const effectiveVariant: BadgeVariant =
    variant === 'auto'
      ? STATUS_VARIANT_MAP[normalizedStatus] || 'neutral'
      : variant;

  const displayLabel = label || status.replace(/_/g, ' ').toLowerCase();

  const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
    success: {
      bg: 'bg-pastel-softgreen text-primary-deep border-primary/20 dark:bg-pastel-softgreen dark:text-pastel-softgreen-foreground',
      dot: 'bg-primary',
    },
    warning: {
      bg: 'bg-pastel-peach text-pastel-peach-foreground border-warning/30 dark:bg-pastel-peach dark:text-pastel-peach-foreground',
      dot: 'bg-warning',
    },
    danger: {
      bg: 'bg-destructive/15 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-destructive-foreground',
      dot: 'bg-destructive',
    },
    info: {
      bg: 'bg-pastel-sky text-pastel-sky-foreground border-info/30 dark:bg-pastel-sky dark:text-pastel-sky-foreground',
      dot: 'bg-info',
    },
    purple: {
      bg: 'bg-pastel-lavender text-pastel-lavender-foreground border-purple/30 dark:bg-pastel-lavender dark:text-pastel-lavender-foreground',
      dot: 'bg-purple',
    },
    neutral: {
      bg: 'bg-muted text-muted-foreground border-border',
      dot: 'bg-muted-foreground',
    },
    auto: {
      bg: 'bg-muted text-muted-foreground border-border',
      dot: 'bg-muted-foreground',
    },
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }[size];

  const currentStyle = variantStyles[effectiveVariant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium capitalize select-none tracking-tight shadow-2xs',
        currentStyle.bg,
        sizeStyles,
        className
      )}
      {...props}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              currentStyle.dot
            )}
          />
        )}
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', currentStyle.dot)} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
}
