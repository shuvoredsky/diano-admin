import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  description,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={htmlFor} className="text-xs font-semibold text-foreground">
            {label}
            {required && <span className="ml-1 text-destructive font-bold">*</span>}
          </Label>
        </div>
      )}
      {children}
      {description && !error && (
        <p className="text-[11px] text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
