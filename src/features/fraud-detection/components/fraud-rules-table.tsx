'use client';

import { useState } from 'react';
import { Settings, Shield, SlidersHorizontal, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef } from '@/components/tables/data-table';
import { PermissionGate } from '@/components/shared/permission-gate';
import {
  useFraudRulesQuery,
  useUpdateFraudRuleMutation,
} from '../hooks/use-fraud-queries';
import type { StoredFraudRule } from '../types/fraud.types';

export function FraudRulesTable() {
  const { data: rules = [], isLoading } = useFraudRulesQuery();
  const updateMutation = useUpdateFraudRuleMutation();

  const [editingRule, setEditingRule] = useState<StoredFraudRule | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = (rule: StoredFraudRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description || '');
    setWeight(rule.weight);
    setEditError(null);
  };

  const handleToggle = async (rule: StoredFraudRule) => {
    try {
      await updateMutation.mutateAsync({
        key: rule.key,
        input: { isEnabled: !rule.isEnabled },
      });
    } catch (err: unknown) {
      console.error('Failed to toggle rule state', err);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    if (weight < 0 || weight > 100) {
      setEditError('Weight must be an integer between 0 and 100');
      return;
    }
    if (name.trim().length < 2) {
      setEditError('Rule name must be at least 2 characters');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        key: editingRule.key,
        input: {
          name: name.trim(),
          description: description.trim() || undefined,
          weight: Math.round(weight),
        },
      });
      setEditingRule(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update rule';
      setEditError(msg);
    }
  };

  const columns: ColumnDef<StoredFraudRule>[] = [
    {
      key: 'name',
      header: 'Rule & Key',
      render: (rule: StoredFraudRule) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-xs text-foreground">
              {rule.name}
            </span>
          </div>
          <code className="text-[10px] text-muted-foreground font-mono">
            {rule.key}
          </code>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (rule: StoredFraudRule) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-sm">
          {rule.description || 'No description provided.'}
        </span>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      render: (rule: StoredFraudRule) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
          {rule.weight} pts
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Active State',
      render: (rule: StoredFraudRule) => (
        <PermissionGate
          permission="fraud:manage"
          fallback={
            <span
              className={`text-xs font-semibold ${
                rule.isEnabled ? 'text-emerald-600' : 'text-muted-foreground'
              }`}
            >
              {rule.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          }
        >
          <button
            type="button"
            role="switch"
            aria-checked={rule.isEnabled}
            disabled={updateMutation.isPending}
            onClick={() => handleToggle(rule)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              rule.isEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                rule.isEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </PermissionGate>
      ),
    },
    {
      key: 'actions',
      header: 'Configure',
      align: 'right',
      render: (rule: StoredFraudRule) => (
        <PermissionGate permission="fraud:manage">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openEditModal(rule)}
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
            Edit
          </Button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={rules}
        total={rules.length}
        page={1}
        limit={100}
        isLoading={isLoading}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        emptyTitle="No fraud rules found"
        emptyDescription="No fraud detection rules configured in database."
      />

      {/* Edit Rule Dialog */}
      {editingRule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Edit Fraud Rule
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {editingRule.key}
                </p>
              </div>
            </div>

            {editError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="rule-name" className="block font-semibold text-foreground mb-1">
                  Rule Name:
                </label>
                <input
                  id="rule-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="rule-desc" className="block font-semibold text-foreground mb-1">
                  Description:
                </label>
                <textarea
                  id="rule-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="rule-weight" className="block font-semibold text-foreground mb-1">
                  Risk Weight Points (0 to 100):
                </label>
                <input
                  id="rule-weight"
                  type="number"
                  min={0}
                  max={100}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  required
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Higher points indicate greater contribution to total fraud risk score.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRule(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateMutation.isPending}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Check className="h-3.5 w-3.5" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
