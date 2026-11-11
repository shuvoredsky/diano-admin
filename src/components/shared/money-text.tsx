import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface MoneyTextProps extends HTMLAttributes<HTMLSpanElement> {
  amount: string | number | null | undefined;
  symbol?: string;
  showSymbol?: boolean;
  colored?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Formats monetary amounts in BDT currency without floating-point math errors.
 * Preserves Decimal precision from backend API strings.
 */
export function formatBdtAmount(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return '0.00';
  }

  const str = String(amount).trim();
  const isNegative = str.startsWith('-');
  const cleanStr = isNegative ? str.slice(1) : str;

  // Split integer and decimal parts
  const [intPart = '0', decPart = '00'] = cleanStr.split('.');
  const paddedDec = (decPart + '00').slice(0, 2);

  // Format integer with commas (Indian/Bangladeshi numbering: 1,00,000 or standard 100,000)
  const num = Number(intPart);
  const formattedInt = isNaN(num)
    ? intPart
    : new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(num);

  const result = `${formattedInt}.${paddedDec}`;
  return isNegative ? `-${result}` : result;
}

export function MoneyText({
  amount,
  symbol = '৳',
  showSymbol = true,
  colored = false,
  size = 'md',
  className,
  ...props
}: MoneyTextProps) {
  const isNegative = typeof amount === 'number' ? amount < 0 : String(amount).trim().startsWith('-');
  const isZero = amount === 0 || amount === '0' || amount === '0.00' || !amount;
  const formatted = formatBdtAmount(amount);

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
    xl: 'text-xl font-bold',
    '2xl': 'text-2xl font-black tracking-tight',
  }[size];

  const colorClass = colored
    ? isNegative
      ? 'text-destructive font-medium'
      : isZero
        ? 'text-muted-foreground'
        : 'text-primary-deep dark:text-primary font-medium'
    : '';

  return (
    <span
      className={cn('tabular-nums inline-flex items-center font-medium', sizeClasses, colorClass, className)}
      {...props}
    >
      {showSymbol && <span className="mr-1 select-none font-sans opacity-90">{symbol}</span>}
      <span>{formatted}</span>
    </span>
  );
}
