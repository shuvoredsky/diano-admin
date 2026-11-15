'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { InvoiceSettings } from '../../types/settings.types';
import { useInvoiceSettingsQuery, useUpdateSettingsMutation } from '../../hooks/use-settings-queries';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { usePermissions } from '@/hooks/use-permissions';

export function InvoiceSettingsForm() {
  const { data: invoice, isLoading } = useInvoiceSettingsQuery();
  const updateMutation = useUpdateSettingsMutation<InvoiceSettings>('invoice');

  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('settings:update');

  const [prefix, setPrefix] = useState('DIA');
  const [footerNote, setFooterNote] = useState('');
  const [termsNote, setTermsNote] = useState('');
  const [showLogo, setShowLogo] = useState(true);
  const [signatureText, setSignatureText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (invoice) {
      setPrefix(invoice.prefix || 'DIA');
      setFooterNote(invoice.footerNote || '');
      setTermsNote(invoice.termsNote || '');
      setShowLogo(invoice.showLogo ?? true);
      setSignatureText(invoice.signatureText || '');
    }
  }, [invoice]);

  const isDirty = Boolean(
    invoice &&
      (prefix !== (invoice.prefix || 'DIA') ||
        footerNote !== (invoice.footerNote || '') ||
        termsNote !== (invoice.termsNote || '') ||
        showLogo !== (invoice.showLogo ?? true) ||
        signatureText !== (invoice.signatureText || ''))
  );
  useDirtyFormGuard(isDirty && !updateMutation.isPending);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const cleanPrefix = prefix.trim().toUpperCase();
    if (!/^[A-Z0-9_-]+$/.test(cleanPrefix)) {
      setStatusMsg({ type: 'error', text: 'Invoice prefix must be uppercase alphanumeric (e.g. DIA, INV).' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        prefix: cleanPrefix,
        footerNote: footerNote.trim() || undefined,
        termsNote: termsNote.trim() || undefined,
        showLogo,
        signatureText: signatureText.trim() || undefined,
      });
      setStatusMsg({ type: 'success', text: 'Invoice template configuration saved.' });
    } catch (err: unknown) {
      let msg = 'Failed to save invoice settings';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  if (isLoading) {
    return <div className="h-64 rounded-2xl border border-border bg-card p-6 animate-pulse" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Invoice & PDF Receipt Format
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="prefix" className="text-xs">Invoice Number Prefix *</Label>
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              disabled={!canUpdate}
              placeholder="DIA"
              className="h-9 text-xs font-mono uppercase"
            />
            <p className="text-[11px] text-muted-foreground">Generates numbers such as DIA-202611-0001</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signatureText" className="text-xs">Authorized Signature Title</Label>
            <Input
              id="signatureText"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              disabled={!canUpdate}
              placeholder="e.g. Authorized Signatory, DIANO BD"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="footerNote" className="text-xs">Invoice Footer Greeting / Note</Label>
            <Input
              id="footerNote"
              value={footerNote}
              onChange={(e) => setFooterNote(e.target.value)}
              disabled={!canUpdate}
              placeholder="Thank you for shopping with DIANO. We cherish your trust in authentic Bangladeshi heritage craftsmanship."
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="termsNote" className="text-xs">Return & Exchange Policy Clause (Printed on PDF)</Label>
            <textarea
              id="termsNote"
              rows={3}
              value={termsNote}
              onChange={(e) => setTermsNote(e.target.value)}
              disabled={!canUpdate}
              placeholder="Returns and exchanges accepted within 7 days in original condition with tags and packaging intact."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 md:col-span-2">
            <input
              id="showLogo"
              type="checkbox"
              checked={showLogo}
              onChange={(e) => setShowLogo(e.target.checked)}
              disabled={!canUpdate}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="showLogo" className="text-xs font-normal cursor-pointer">
              Print official store logo on downloaded invoice PDFs
            </Label>
          </div>
        </div>
      </div>

      {canUpdate && (
        <div className="flex items-center justify-end">
          <Button type="submit" size="sm" disabled={updateMutation.isPending} className="cursor-pointer">
            {updateMutation.isPending ? 'Saving...' : 'Save Invoice Configuration'}
          </Button>
        </div>
      )}
    </form>
  );
}
