'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { useCreateStaffMutation, useUpdateStaffMutation } from '../hooks/use-staff-queries';
import { TemporaryPasswordCard } from './temporary-password-card';
import type { StaffUser, CreateStaffInput, UpdateStaffInput } from '../types/staff.types';

export interface StaffFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffToEdit?: StaffUser | null;
  rolesList?: Array<{ slug: string; name: string }>;
}

export function StaffFormModal({
  open,
  onOpenChange,
  staffToEdit,
  rolesList = [],
}: StaffFormModalProps) {
  const isEditing = Boolean(staffToEdit);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleSlug, setRoleSlug] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [tempPasswordDisplay, setTempPasswordDisplay] = useState<string | null>(null);

  const createMutation = useCreateStaffMutation();
  const updateMutation = useUpdateStaffMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const isDirty = Boolean(
    isEditing
      ? name !== staffToEdit?.name || phone !== (staffToEdit?.phone || '') || roleSlug !== (staffToEdit?.roles[0]?.slug || '')
      : name || email || phone || roleSlug || password
  );
  useDirtyFormGuard(isDirty && open && !isPending && !tempPasswordDisplay);

  useEffect(() => {
    if (!open) {
      setTempPasswordDisplay(null);
      setApiError(null);
      return;
    }

    if (staffToEdit) {
      setName(staffToEdit.name);
      setEmail(staffToEdit.email);
      setPhone(staffToEdit.phone || '');
      setRoleSlug(staffToEdit.roles[0]?.slug || '');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRoleSlug((prev) => prev || rolesList[0]?.slug || '');
      setPassword('');
    }
    setApiError(null);
  }, [staffToEdit, open, rolesList]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (name.trim().length < 2) {
      setApiError('Name must be at least 2 characters');
      return;
    }

    if (!isEditing && !email.trim()) {
      setApiError('Valid email address is required');
      return;
    }

    if (phone.trim() && !/^(?:\+8801|01)[3-9]\d{8}$/.test(phone.trim())) {
      setApiError('Valid Bangladeshi phone number required (+8801XXXXXXXXX or 01XXXXXXXXX)');
      return;
    }

    if (!roleSlug) {
      setApiError('Role assignment is required');
      return;
    }

    if (!isEditing && password && password.length < 6) {
      setApiError('Password must be at least 6 characters');
      return;
    }

    try {
      if (isEditing && staffToEdit) {
        const updatePayload: UpdateStaffInput = {
          name: name.trim(),
          phone: phone.trim() ? phone.trim() : null,
          roleSlug,
        };
        await updateMutation.mutateAsync({ id: staffToEdit.id, input: updatePayload });
        onOpenChange(false);
      } else {
        const createPayload: CreateStaffInput = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() ? phone.trim() : null,
          roleSlug,
          password: password ? password : undefined,
        };
        const created = await createMutation.mutateAsync(createPayload);
        if (created?.temporaryPassword) {
          setTempPasswordDisplay(created.temporaryPassword);
        } else {
          onOpenChange(false);
        }
      }
    } catch (err: unknown) {
      let msg = 'Failed to save staff account';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setApiError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isEditing ? 'Edit Staff Member' : 'Invite / Create Staff Account'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure role access tier and contact details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {tempPasswordDisplay ? (
          <TemporaryPasswordCard
            temporaryPassword={tempPasswordDisplay}
            onDone={() => {
              setTempPasswordDisplay(null);
              onOpenChange(false);
            }}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-name" className="text-xs">Full Name *</Label>
            <Input
              id="staff-name"
              placeholder="e.g. Tanvir Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-email" className="text-xs">Email Address *</Label>
            <Input
              id="staff-email"
              type="email"
              placeholder="staff@diano.com.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditing}
              className="h-9 text-xs disabled:opacity-60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-phone" className="text-xs">Phone (BD Number)</Label>
            <Input
              id="staff-phone"
              placeholder="01711223344 or +8801711223344"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-role" className="text-xs">Assigned Role *</Label>
            <select
              id="staff-role"
              value={roleSlug}
              onChange={(e) => setRoleSlug(e.target.value)}
              className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              required
            >
              {rolesList.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name} ({r.slug})
                </option>
              ))}
            </select>
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="staff-password" className="text-xs">Initial Password (Optional)</Label>
              <div className="relative">
                <Input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="e.g. 12345678 or leave blank for auto-generation"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-hidden"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Minimum 6 characters (e.g. 12345678). If omitted, a secure credentials token will be auto-generated.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Privilege protection is enforced: You cannot assign a role tier equal to or higher than your own administrative standing.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 text-xs"
            >
              {isPending ? 'Saving...' : isEditing ? 'Update Staff' : 'Create Account'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
