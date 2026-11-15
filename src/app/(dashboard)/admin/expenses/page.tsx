import type { Metadata } from 'next';
import { ExpensesManager } from '@/features/expenses';

export const metadata: Metadata = {
  title: 'Expenses Management | DIANO Admin',
  description: 'Manage store operating expenses and overheads.',
};

export default function ExpensesPage() {
  return <ExpensesManager />;
}
