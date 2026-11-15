import { api } from '@/lib/api/browser-client';
import type {
  AuditLogEntry,
  AuditLogFilterParams,
  AuditLogsListResult,
} from '../types/audit-logs.types';

export async function fetchAuditLogs(params?: AuditLogFilterParams): Promise<AuditLogsListResult> {
  const queryParams: Record<string, string | number> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.actor) queryParams.actor = params.actor;
  if (params?.actorId) queryParams.actorId = params.actorId;
  if (params?.actorType) queryParams.actorType = params.actorType;
  if (params?.action) queryParams.action = params.action;
  if (params?.targetType) queryParams.targetType = params.targetType;
  if (params?.targetId) queryParams.targetId = params.targetId;
  if (params?.from) queryParams.from = params.from;
  if (params?.to) queryParams.to = params.to;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  const res = await api.get<{
    success: boolean;
    data: AuditLogEntry[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>('/admin/audit-logs', { params: queryParams });

  return {
    items: res.data.data ?? [],
    total: res.data.pagination?.total ?? (res.data.data?.length ?? 0),
    page: res.data.pagination?.page ?? 1,
    limit: res.data.pagination?.limit ?? 20,
    totalPages: res.data.pagination?.totalPages ?? 1,
  };
}

export async function getAuditLogById(id: string): Promise<AuditLogEntry> {
  const res = await api.get<{
    success: boolean;
    data: AuditLogEntry;
  }>(`/admin/audit-logs/${id}`);

  return res.data.data;
}
