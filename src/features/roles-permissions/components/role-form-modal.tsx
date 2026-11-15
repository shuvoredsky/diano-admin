'use client';

import { useState, useEffect } from 'react';
import { X, ShieldPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../hooks/use-roles-queries';
import type { RoleSummaryItem, CreateRoleInput, UpdateRoleInput } from '../types/roles.types';

export interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleToEdit?: RoleSummaryItem | null;
}

export function RoleFormModal({ open, onOpenChange, roleToEdit }: RoleFormModalProps) {
  const isEditing = Boolean(roleToEdit);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const isDirty = Boolean(
    isEditing
      ? name !== roleToEdit?.name || description !== (roleToEdit?.description || '')
      : name || slug || description
  );
  useDirtyFormGuard(isDirty && open && !isPending);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setSlug(roleToEdit.slug);
      setDescription(roleToEdit.description || '');
    } else {
      setName('');
      setSlug('');
      setDescription('');
    }
    setApiError(null);
  }, [roleToEdit, open]);

  if (!open) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (name.trim().length < 2) {
      setApiError('Role name must be at least 2 characters');
      return;
    }

    const cleanSlug = slug.trim().toLowerCase();
    if (!isEditing && !/^[a-z0-9-]+$/.test(cleanSlug)) {
      setApiError('Slug must contain only lowercase alphanumeric characters and hyphens');
      return;
    }

    try {
      if (isEditing && roleToEdit) {
        const updatePayload: UpdateRoleInput = {
          name: name.trim(),
          description: description.trim() ? description.trim() : undefined,
        };
        await updateMutation.mutateAsync({ id: roleToEdit.id, input: updatePayload });
      } else {
        const createPayload: CreateRoleInput = {
          name: name.trim(),
          slug: cleanSlug,
          description: description.trim() ? description.trim() : undefined,
        };
        await createMutation.mutateAsync(createPayload);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      let msg = 'Failed to save role';
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
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isEditing ? 'Edit Role' : 'Create Custom Role'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Define administrative access tier identifier and label.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role-name" className="text-xs">Role Name *</Label>
            <Input
              id="role-name"
              placeholder="e.g. Catalog Specialist"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-slug" className="text-xs">Identifier Slug *</Label>
            <Input
              id="role-slug"
              placeholder="e.g. catalog-specialist"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              disabled={isEditing}
              className="h-9 text-xs font-mono disabled:opacity-60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-description" className="text-xs">Description</Label>
            <textarea
              id="role-description"
              rows={3}
              placeholder="Summarize responsibilities and authorized operational scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
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
              {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
