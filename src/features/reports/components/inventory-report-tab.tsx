'use client';

import { useState } from 'react';
import { Download, Boxes, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventoryReportSummaryQuery, useReportExportMutation } from '../hooks/use-reports-queries';

export function InventoryReportTab() {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [warehouseId, setWarehouseId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: summary, isLoading, isError, error, refetch } = useInventoryReportSummaryQuery();

  const exportMutation = useReportExportMutation('inventory');

  const handleExport = async () => {
    setExportError(null);
    try {
      await exportMutation.mutateAsync({
        format,
        warehouseId: warehouseId.trim() || undefined,
        categoryId: categoryId.trim() || undefined,
        lowStockOnly,
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
          <Boxes className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Inventory Valuation Parameters</h3>
        </div>

        {exportError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="inv-warehouse" className="text-xs font-semibold">Warehouse ID (Optional)</Label>
            <Input
              id="inv-warehouse"
              placeholder="e.g. wh-central-dhaka"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="inv-category" className="text-xs font-semibold">Category ID (Optional)</Label>
            <Input
              id="inv-category"
              placeholder="e.g. cat-panjabi or cm..."
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-9 text-xs font-mono"
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

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="low-stock-toggle"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
          />
          <Label htmlFor="low-stock-toggle" className="text-xs font-medium cursor-pointer">
            Export low-stock / reorder alert items only
          </Label>
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {exportMutation.isPending ? 'Generating Export...' : `Download Inventory (${format.toUpperCase()})`}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Warehouse Inventory Snapshot (Live API)
        </h4>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border p-4 text-xs text-muted-foreground flex items-center justify-between">
            <span>Failed to load stock snapshot: {error instanceof Error ? error.message : 'Unknown'}</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1 cursor-pointer">
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Total Catalog Products</span>
              <span className="text-lg font-bold text-foreground">
                {summary.totalProducts ?? '—'}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Available Stock Units</span>
              <span className="text-lg font-bold text-emerald-600">
                {summary.available ?? summary.totalStockUnits ?? '—'}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Reserved Stock Units</span>
              <span className="text-lg font-bold text-amber-600">
                {summary.reserved ?? '0'}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-[11px] text-muted-foreground block">Damaged / Quarantine</span>
              <span className="text-lg font-bold text-destructive">
                {summary.damaged ?? '0'}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
