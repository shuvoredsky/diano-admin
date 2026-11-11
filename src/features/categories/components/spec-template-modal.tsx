'use client';

import { useState, useEffect } from 'react';
import { useUpdateSpecTemplateMutation } from '../hooks/use-categories-queries';
import type { CategoryItem, SpecificationField } from '../types/categories.types';
import { Plus, Trash2, X, Loader2, AlertCircle, Sliders } from 'lucide-react';

export interface SpecTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryItem | null;
}

export function SpecTemplateModal({ isOpen, onClose, category }: SpecTemplateModalProps) {
  const [fields, setFields] = useState<SpecificationField[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useUpdateSpecTemplateMutation();
  const isSaving = mutation.isPending;

  useEffect(() => {
    if (isOpen && category) {
      setError(null);
      setFields(category.specificationTemplate || []);
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      {
        key: `spec_${Date.now()}`,
        label: '',
        type: 'text',
        required: false,
        options: [],
        sortOrder: prev.length,
      },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateField = (index: number, updates: Partial<SpecificationField>) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const handleSave = async () => {
    setError(null);
    // Basic validation
    for (const f of fields) {
      if (!f.key.trim() || !f.label.trim()) {
        setError('All specification fields must have a valid key and label.');
        return;
      }
    }

    try {
      await mutation.mutateAsync({
        id: category.id,
        template: fields.map((f, idx) => ({ ...f, sortOrder: idx })),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update specification template');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Specification Template: {category.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Attributes required or recommended for products in this category
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {fields.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              No specification fields defined yet. Click &quot;Add Field&quot; below to add specifications like Fabric, Fit, Warranty, etc.
            </div>
          ) : (
            fields.map((field, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Key
                    </label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => handleUpdateField(idx, { key: e.target.value })}
                      placeholder="e.g. fabric"
                      className="w-full h-8 rounded-lg border border-border bg-card px-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                      placeholder="e.g. Fabric Material"
                      className="w-full h-8 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Input Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        handleUpdateField(idx, {
                          type: e.target.value as 'text' | 'select' | 'number',
                        })
                      }
                      className="w-full h-8 rounded-lg border border-border bg-card px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="text">Text Input</option>
                      <option value="select">Dropdown Select</option>
                      <option value="number">Number</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Required</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer mt-5"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={handleAddField}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-deep transition-colors pt-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Specification Field</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-9 px-4 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 h-9 px-5 rounded-xl bg-primary hover:bg-primary-deep text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Template</span>
          </button>
        </div>
      </div>
    </div>
  );
}

