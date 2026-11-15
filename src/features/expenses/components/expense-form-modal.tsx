'use client';

import { useState, useEffect } from 'react';
import { X, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDirtyFormGuard } from '@/lib/crud/use-dirty-form-guard';
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '../hooks/use-expenses-queries';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from '../constants/expenses.constants';
import type { ExpenseEntity, ExpenseCategory } from '../types/expenses.types';

export interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: ExpenseEntity | null;
}

export function ExpenseFormModal({
  isOpen,
  onClose,
  expenseToEdit,
}: ExpenseFormModalProps) {
  const isEditing = Boolean(expenseToEdit);

  const [category, setCategory] = useState<ExpenseCategory>('RENT');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isDirty = Boolean(amount || note || (isEditing && category !== expenseToEdit?.category));
  useDirtyFormGuard(isDirty && isOpen);

  useEffect(() => {
    if (expenseToEdit) {
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount);
      setDate(expenseToEdit.date ? expenseToEdit.date.slice(0, 10) : '');
      setNote(expenseToEdit.note || '');
    } else {
      setCategory('RENT');
      setAmount('');
      const todayDhaka = new Date().toISOString().slice(0, 10);
      setDate(todayDhaka);
      setNote('');
    }
    setFormError(null);
  }, [expenseToEdit, isOpen]);

  const createMutation = useCreateExpenseMutation();
  const updateMutation = useUpdateExpenseMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanAmount = amount.trim();
    if (!cleanAmount) {
      setFormError('Expense amount is required');
      return;
    }

    // Exact decimal validation (no float parsing errors, positive monetary decimal with at most 2 decimal places)
    if (!/^\d+(\.\d{1,2})?$/.test(cleanAmount) || Number(cleanAmount) <= 0) {
      setFormError('Amount must be a positive monetary decimal (e.g. 1500 or 1500.50)');
      return;
    }

    if (!date) {
      setFormError('Expense date is required');
      return;
    }

    if (note.trim().length > 500) {
      setFormError('Note must not exceed 500 characters');
      return;
    }

    const payload = {
      category,
      amount: cleanAmount,
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
    };

    try {
      if (isEditing && expenseToEdit) {
        await updateMutation.mutateAsync({
          id: expenseToEdit.id,
          input: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save expense';
      setFormError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              {isEditing ? 'Edit Operating Expense' : 'Record Operating Expense'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="expense-category" className="text-xs font-semibold">
              Category <span className="text-destructive">*</span>
            </Label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden cursor-pointer"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {EXPENSE_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="expense-amount" className="text-xs font-semibold">
                Amount (৳ BDT) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 25000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="expense-date" className="text-xs font-semibold">
                Date (Asia/Dhaka) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="expense-note" className="text-xs font-semibold">
              Description / Voucher Note
            </Label>
            <textarea
              id="expense-note"
              rows={3}
              maxLength={500}
              placeholder="e.g. Office rent for Mirpur branch showroom (Dec 2026)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
            <div className="text-[10px] text-muted-foreground text-right">
              {note.length} / 500 characters
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5 cursor-pointer"
            >
              {isPending
                ? isEditing
                  ? 'Updating...'
                  : 'Recording...'
                : isEditing
                  ? 'Update Expense'
                  : 'Save Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
