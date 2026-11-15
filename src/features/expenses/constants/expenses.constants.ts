import type { ExpenseCategory } from '../types/expenses.types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'RENT',
  'SALARIES',
  'UTILITIES',
  'MARKETING',
  'PACKAGING',
  'LOGISTICS',
  'OFFICE_SUPPLIES',
  'SOFTWARE_SUBSCRIPTION',
  'MAINTENANCE',
  'OTHER',
];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Rent & Lease',
  SALARIES: 'Salaries & Payroll',
  UTILITIES: 'Utilities & Bills',
  MARKETING: 'Marketing & Advertising',
  PACKAGING: 'Packaging Materials',
  LOGISTICS: 'Logistics & Courier Delivery',
  OFFICE_SUPPLIES: 'Office Supplies & Equipment',
  SOFTWARE_SUBSCRIPTION: 'Software & SaaS Subscriptions',
  MAINTENANCE: 'Repairs & Maintenance',
  OTHER: 'Other Miscellaneous Expenses',
};
