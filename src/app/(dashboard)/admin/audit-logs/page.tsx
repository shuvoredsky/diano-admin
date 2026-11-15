import type { Metadata } from 'next';
import { AuditLogsManager } from '@/features/audit-logs';

export const metadata: Metadata = {
  title: 'Audit Logs & Security Events | DIANO Admin',
  description: 'Immutable, append-only administrative and security event logs.',
};

export default function AdminAuditLogsPage() {
  return <AuditLogsManager />;
}
