import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs, getAuditLogById } from '../api/audit-logs.api';
import type { AuditLogFilterParams } from '../types/audit-logs.types';

export const AUDIT_LOGS_QUERY_KEYS = {
  all: ['audit-logs'] as const,
  list: (params?: AuditLogFilterParams) => ['audit-logs', 'list', params] as const,
  detail: (id: string | null) => ['audit-logs', 'detail', id] as const,
};

export function useAuditLogsQuery(params?: AuditLogFilterParams) {
  return useQuery({
    queryKey: AUDIT_LOGS_QUERY_KEYS.list(params),
    queryFn: () => fetchAuditLogs(params),
    placeholderData: (prev) => prev,
  });
}

export function useAuditLogDetailQuery(id: string | null) {
  return useQuery({
    queryKey: AUDIT_LOGS_QUERY_KEYS.detail(id),
    queryFn: () => (id ? getAuditLogById(id) : null),
    enabled: Boolean(id),
  });
}
