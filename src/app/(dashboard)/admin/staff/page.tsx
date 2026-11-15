import type { Metadata } from 'next';
import { StaffManager } from '@/features/staff/components/staff-manager';

export const metadata: Metadata = {
  title: 'Staff Management | DIANO Admin',
  description: 'Manage admin staff accounts, permissions, and operational status.',
};

export default function AdminStaffPage() {
  return <StaffManager />;
}
