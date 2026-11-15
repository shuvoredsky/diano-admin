'use client';

import { useState } from 'react';
import { Download, Landmark, AlertCircle, ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyText } from '@/components/shared/money-text';
import { DHAKA_PERIOD_OPTIONS, type DhakaPeriodOption } from '@/lib/utils/dhaka-period';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/constants/permissions';
import { useFinancialReportSummaryQuery, useReportExportMutation } from '../hooks/use-reports-queries';
import type { ReportFormat } from '../types/reports.types';

export function FinancialReportTab() {
  const { hasPermission } = usePermissions();
  const canViewFinance = hasPermission(PERMISSIONS.ANALYTICS_VIEW_FINANCE);

  const [format, setFormat] = useState<ReportFormat>('csv');
  const [period, setPeriod] = useState<DhakaPeriodOption>('this_month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: summary, isLoading, isError, error, refetch } = useFinancialReportSummaryQuery(
    period,
    from || undefined,
    to || undefined
  );

  const exportMutation = useReportExportMutation('financial');

  const handleExport = async () => {
    setExportError(null);
    try {
      await exportMutation.mutateAsync({
        format,
        period: period !== 'custom' ? period : undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setExportError(msg);
    }
  };

  if (!canViewFinance) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">Restricted Financial Access</h3>
        <p className="max-w-md mx-auto text-xs text-muted-foreground">
          Financial statements, revenue margins, COGS, and operating expense ledger downloads require the{' '}
          <code className="font-mono text-primary">analytics:view_finance</code> permission. Contact your system
          administrator to request access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Landmark className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Financial Statement Parameters</h3>
        </div>

        {exportError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Reporting Period (Dhaka)</Label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as DhakaPeriodOption)}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
            >
              {DHAKA_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Export Format</Label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ReportFormat)}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
            >
              <option value="csv">CSV Spreadsheet (.csv)</option>
              <option value="xlsx">Excel Workbook (.xlsx)</option>
              <option value="pdf">Audited PDF Statement (.pdf)</option>
            </select>
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3 max-w-md pt-1">
            <div className="space-y-1">
              <Label htmlFor="fin-from" className="text-xs">From Date</Label>
              <Input
                id="fin-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fin-to" className="text-xs">To Date</Label>
              <Input
                id="fin-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-2">
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {exportMutation.isPending ? 'Generating Statement...' : `Download Financials (${format.toUpperCase()})`}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Financial Statement Metrics (Live API Only)
        </h4>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border p-4 text-xs text-muted-foreground flex items-center justify-between">
            <span>Failed to load financial summary: {error instanceof Error ? error.message : 'Unknown'}</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1 cursor-pointer">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Gross Sales</span>
              <span className="text-lg font-bold text-foreground">
                <MoneyText amount={summary.cards?.grossSales?.current ?? summary.grossSales ?? '0.00'} />
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Delivered Sales (Settled)</span>
              <span className="text-lg font-bold text-emerald-600">
                <MoneyText amount={summary.cards?.deliveredSales?.current ?? summary.deliveredSales ?? '0.00'} />
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Net Revenue</span>
              <span className="text-lg font-bold text-foreground">
                <MoneyText amount={summary.cards?.netSales?.current ?? summary.netSales ?? '0.00'} />
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
