'use client';

import { useState } from 'react';
import { Download, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoneyText } from '@/components/shared/money-text';
import { DHAKA_PERIOD_OPTIONS, type DhakaPeriodOption } from '@/lib/utils/dhaka-period';
import { useOrdersReportSummaryQuery, useReportExportMutation } from '../hooks/use-reports-queries';
import { REPORT_ORDER_STATUSES, REPORT_PAYMENT_METHODS } from '../constants/reports.constants';
import type { ReportFormat } from '../types/reports.types';

export function OrdersReportTab() {
  const [format, setFormat] = useState<ReportFormat>('csv');
  const [period, setPeriod] = useState<DhakaPeriodOption>('this_month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'' | 'COD' | 'SSLCOMMERZ'>('');
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: summary, isLoading, isError, error, refetch } = useOrdersReportSummaryQuery(
    period,
    from || undefined,
    to || undefined
  );

  const exportMutation = useReportExportMutation('orders');

  const handleExport = async () => {
    setExportError(null);
    try {
      await exportMutation.mutateAsync({
        format,
        period: period !== 'custom' ? period : undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
        status: status || undefined,
        paymentMethod: paymentMethod || undefined,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setExportError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Orders Export Parameters</h3>
        </div>

        {exportError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <Label className="text-xs font-semibold">Order Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
            >
              {REPORT_ORDER_STATUSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Payment Method</Label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as '' | 'COD' | 'SSLCOMMERZ')}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
            >
              {REPORT_PAYMENT_METHODS.map((opt) => (
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
              <option value="pdf">Document PDF (.pdf)</option>
            </select>
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3 max-w-md pt-1">
            <div className="space-y-1">
              <Label htmlFor="orders-from" className="text-xs">From Date</Label>
              <Input
                id="orders-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="orders-to" className="text-xs">To Date</Label>
              <Input
                id="orders-to"
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
            {exportMutation.isPending ? 'Generating Export...' : `Download Orders (${format.toUpperCase()})`}
          </Button>
        </div>
      </div>

      {/* API Summary Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Period Summary Snapshot (Live API)
        </h4>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border p-4 text-xs text-muted-foreground flex items-center justify-between">
            <span>Failed to load summary: {error instanceof Error ? error.message : 'Unknown'}</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1 cursor-pointer">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Total Orders</span>
              <span className="text-xl font-bold text-foreground">
                {summary.totalOrders ?? summary.count ?? '—'}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Fulfilled / Delivered</span>
              <span className="text-xl font-bold text-foreground">
                {summary.deliveredOrders ?? summary.completed ?? '—'}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Average Order Value</span>
              <span className="text-xl font-bold text-foreground">
                {summary.averageOrderValue ? (
                  <MoneyText amount={summary.averageOrderValue} />
                ) : (
                  '—'
                )}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
