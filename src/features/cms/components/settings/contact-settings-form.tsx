'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ContactSettings } from '../../types/settings.types';
import { useContactSettingsQuery, useUpdateSettingsMutation } from '../../hooks/use-settings-queries';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { usePermissions } from '@/hooks/use-permissions';

export function ContactSettingsForm() {
  const { data: contact, isLoading } = useContactSettingsQuery();
  const updateMutation = useUpdateSettingsMutation<ContactSettings>('contact');

  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('settings:update');

  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [address, setAddress] = useState('');
  const [supportHours, setSupportHours] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (contact) {
      setSupportPhone(contact.supportPhone || '');
      setSupportEmail(contact.supportEmail || '');
      setAddress(contact.address || '');
      setSupportHours(contact.supportHours || '');
    }
  }, [contact]);

  const isDirty = Boolean(
    contact &&
      (supportPhone !== (contact.supportPhone || '') ||
        supportEmail !== (contact.supportEmail || '') ||
        address !== (contact.address || '') ||
        supportHours !== (contact.supportHours || ''))
  );
  useDirtyFormGuard(isDirty && !updateMutation.isPending);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (supportPhone.trim().length < 6) {
      setStatusMsg({ type: 'error', text: 'Support phone must be at least 6 digits.' });
      return;
    }
    if (!supportEmail.includes('@')) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid support email address.' });
      return;
    }
    if (address.trim().length < 5) {
      setStatusMsg({ type: 'error', text: 'Address must be at least 5 characters.' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        supportPhone: supportPhone.trim(),
        supportEmail: supportEmail.trim(),
        address: address.trim(),
        supportHours: supportHours.trim(),
      });
      setStatusMsg({ type: 'success', text: 'Customer care contact details saved.' });
    } catch (err: unknown) {
      let msg = 'Failed to save contact settings';
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
          Customer Support & Helplines (Display on Storefront & Emails)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="supportPhone" className="text-xs">Direct Support Hotline *</Label>
            <Input
              id="supportPhone"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              disabled={!canUpdate}
              placeholder="+880 9612 000000"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supportEmail" className="text-xs">Direct Support Email *</Label>
            <Input
              id="supportEmail"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              disabled={!canUpdate}
              placeholder="care@diano.com"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="contactAddress" className="text-xs">Physical Return & Customer Care Depot *</Label>
            <Input
              id="contactAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!canUpdate}
              placeholder="House 42, Road 11, Block D, Banani, Dhaka 1213"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="supportHours" className="text-xs">Operational Support Hours (Dhaka Time)</Label>
            <Input
              id="supportHours"
              value={supportHours}
              onChange={(e) => setSupportHours(e.target.value)}
              disabled={!canUpdate}
              placeholder="Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {canUpdate && (
        <div className="flex items-center justify-end">
          <Button type="submit" size="sm" disabled={updateMutation.isPending} className="cursor-pointer">
            {updateMutation.isPending ? 'Saving...' : 'Save Contact Configuration'}
          </Button>
        </div>
      )}
    </form>
  );
}
