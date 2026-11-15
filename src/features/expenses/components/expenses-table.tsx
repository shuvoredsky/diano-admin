'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoneyText } from '@/components/shared/money-text';
import { DateText } from '@/components/shared/date-text';
import { EmptyState } from '@/components/feedback/empty-state';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/constants/permissions';
import { useDeleteExpenseMutation } from '../hooks/use-expenses-queries';
import { EXPENSE_CATEGORY_LABELS } from '../constants/expenses.constants';
import type { ExpenseEntity } from '../types/expenses.types';

export interface ExpensesTableProps {
  expenses: ExpenseEntity[];
  isLoading: boolean;
  onEditExpense: (expense: ExpenseEntity) => void;
}

export function ExpensesTable({
  expenses,
  isLoading,
  onEditExpense,
}: ExpensesTableProps) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.EXPENSE_MANAGE);

  const deleteMutation = useDeleteExpenseMutation();
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseEntity | null>(null);

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    await deleteMutation.mutateAsync(expenseToDelete.id);
    setExpenseToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <EmptyState
          title="No expenses found"
          description="Operational and business expenses recorded will appear here."
        />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Expense Date</th>
                <th className="px-4 py-3">Description / Voucher Note</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                      {EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-foreground text-sm">
                    <MoneyText amount={exp.amount} />
                  </td>
                  <td className="px-4 py-3.5 text-foreground whitespace-nowrap">
                    <DateText date={exp.date} format="short" />
                  </td>
                  <td className="px-4 py-3.5 max-w-[260px] text-muted-foreground truncate">
                    {exp.note || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                    <DateText date={exp.createdAt} format="short" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {canManage && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditExpense(exp)}
                          title="Edit expense"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpenseToDelete(exp)}
                          title="Delete expense"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(expenseToDelete)}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        description="Are you sure you want to permanently delete this expense voucher? This action cannot be undone."
        confirmLabel="Delete Expense"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
