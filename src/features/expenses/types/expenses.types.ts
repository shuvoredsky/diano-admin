export type ExpenseCategory =
  | 'RENT'
  | 'SALARIES'
  | 'UTILITIES'
  | 'MARKETING'
  | 'PACKAGING'
  | 'LOGISTICS'
  | 'OFFICE_SUPPLIES'
  | 'SOFTWARE_SUBSCRIPTION'
  | 'MAINTENANCE'
  | 'OTHER';

export interface ExpenseEntity {
  id: string;
  category: ExpenseCategory;
  amount: string;
  date: string;
  note: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilter {
  category?: ExpenseCategory;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: string;
  date: string;
  note?: string;
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory;
  amount?: string;
  date?: string;
  note?: string | null;
}

