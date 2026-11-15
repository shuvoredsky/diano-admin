'use client';

import { useState } from 'react';
import { Download, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomersReportSummaryQuery, useReportExportMutation } from '../hooks/use-reports-queries';

export function CustomersReportTab() {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [minOrders, setMinOrders] = useState('');
  const [district, setDistrict] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: summary, isLoading, isError, error, refetch } = useCustomersReportSummaryQuery();

  const exportMutation = useReportExportMutation('customers');

  const handleExport = async () => {
    setExportError(null);
    try {
      await exportMutation.mutateAsync({
        format,
        minOrders: minOrders ? Number(minOrders) : undefined,
        district: district.trim() || undefined,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setExportError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Customer Cohort Export Parameters</h3>
        </div>

        {exportError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="cust-min-orders" className="text-xs font-semibold">Minimum Orders Placed</Label>
            <Input
              id="cust-min-orders"
              type="number"
              min="0"
              placeholder="e.g. 2 for repeat buyers"
              value={minOrders}
              onChange={(e) => setMinOrders(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cust-district" className="text-xs font-semibold">District / Geographic Region</Label>
            <Input
              id="cust-district"
              placeholder="e.g. Dhaka or Chittagong"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Export Format</Label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'csv' | 'xlsx')}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
            >
              <option value="csv">CSV Spreadsheet (.csv)</option>
              <option value="xlsx">Excel Workbook (.xlsx)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {exportMutation.isPending ? 'Generating Export...' : `Download Customers (${format.toUpperCase()})`}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Customer Insights Snapshot (Live API)
        </h4>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border p-4 text-xs text-muted-foreground flex items-center justify-between">
            <span>Failed to load customer summary: {error instanceof Error ? error.message : 'Unknown'}</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1 cursor-pointer">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Registered Customers</span>
              <span className="text-lg font-bold text-foreground">
                {summary.totalCustomers ?? summary.total ?? '—'}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Active / Repeat Buyers</span>
              <span className="text-lg font-bold text-emerald-600">
                {summary.activeCustomers ?? summary.repeatCustomers ?? '—'}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Average Lifetime Orders</span>
              <span className="text-lg font-bold text-foreground">
                {summary.avgOrdersPerCustomer ?? '—'}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
