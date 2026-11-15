'use client';

import { Eye, Shield, Terminal } from 'lucide-react';
import { DateText } from '@/components/shared/date-text';
import { Button } from '@/components/ui/button';
import type { AuditLogEntry } from '../types/audit-logs.types';

export interface AuditLogsTableProps {
  logs: AuditLogEntry[];
  isLoading: boolean;
  onViewDetail: (log: AuditLogEntry) => void;
}

export function AuditLogsTable({
  logs,
  isLoading,
  onViewDetail,
}: AuditLogsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
        Loading audit events log...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Shield className="h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs font-medium text-foreground">No audit log entries found</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Events will appear here as administrative and security actions are executed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border/80 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Timestamp (Dhaka)</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Target Entity</th>
            <th className="px-4 py-3">IP Address</th>
            <th className="px-4 py-3 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {logs.map((log) => {
            return (
              <tr
                key={log.id}
                className="hover:bg-muted/20 transition-colors"
              >
                {/* Timestamp */}
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  <DateText date={log.createdAt} format="datetime" showTimezone />
                </td>

                {/* Actor */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground leading-tight">
                    {log.actor?.name ?? log.actorType}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {log.actor?.email ?? log.actorId ?? 'system'}
                  </div>
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                    <Terminal className="h-3 w-3 text-muted-foreground" />
                    {log.action}
                  </span>
                </td>

                {/* Target Entity */}
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{log.targetType}</span>
                  {log.targetId && (
                    <span className="block font-mono text-[10px] text-muted-foreground line-clamp-1">
                      {log.targetId}
                    </span>
                  )}
                </td>

                {/* IP Address */}
                <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  {log.ipAddress ?? '—'}
                </td>

                {/* Inspect Action */}
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(log)}
                    className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                    title="Inspect Audit Event Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Inspect
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
