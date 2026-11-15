export interface AuditLogActor {
  id: string;
  name: string;
  email: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorType: string;
  actor: AuditLogActor | null;
  action: string;
  targetType: string;
  targetId: string | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogFilterParams {
  page?: number;
  limit?: number;
  actor?: string;
  actorId?: string;
  actorType?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogsListResult {
  items: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
