import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '@/components/tables/data-table';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/admin/orders',
  useSearchParams: () => new URLSearchParams('page=1&limit=10'),
}));

interface OrderItem extends Record<string, unknown> {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
}

const mockColumns = [
  { key: 'orderNumber', header: 'Order #' },
  { key: 'customerName', header: 'Customer' },
  {
    key: 'total',
    header: 'Total',
    sortable: true,
    render: (row: OrderItem) => `৳ ${row.total}`,
  },
];

const mockData: OrderItem[] = [
  { id: '1', orderNumber: 'ORD-101', customerName: 'Rahim Khan', total: 1200 },
  { id: '2', orderNumber: 'ORD-102', customerName: 'Karim Ullah', total: 3400 },
];

describe('DataTable Component', () => {
  it('renders table headers and rows accurately', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        total={2}
        page={1}
        limit={10}
        syncWithUrl={false}
      />
    );

    expect(screen.getByText('Order #')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();

    expect(screen.getByText('ORD-101')).toBeInTheDocument();
    expect(screen.getByText('Rahim Khan')).toBeInTheDocument();
    expect(screen.getByText('৳ 1200')).toBeInTheDocument();

    expect(screen.getByText('ORD-102')).toBeInTheDocument();
    expect(screen.getByText('Karim Ullah')).toBeInTheDocument();
    expect(screen.getByText('৳ 3400')).toBeInTheDocument();
  });

  it('renders EmptyState when data array is empty and not loading', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        total={0}
        emptyTitle="No orders placed yet"
        emptyDescription="Your store hasn't received any orders."
        syncWithUrl={false}
      />
    );

    expect(screen.getByText('No orders placed yet')).toBeInTheDocument();
    expect(screen.getByText("Your store hasn't received any orders.")).toBeInTheDocument();
  });

  it('calls onSortChange when sortable header is clicked', () => {
    const handleSortChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        total={2}
        onSortChange={handleSortChange}
        syncWithUrl={false}
      />
    );

    const sortButton = screen.getByRole('button', { name: /Total/i });
    fireEvent.click(sortButton);

    expect(handleSortChange).toHaveBeenCalledWith('total', 'asc');
  });

  it('handles page navigation buttons', () => {
    const handlePageChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        total={30}
        page={1}
        limit={10}
        onPageChange={handlePageChange}
        syncWithUrl={false}
      />
    );

    const nextButton = screen.getByTitle('Next page');
    fireEvent.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
