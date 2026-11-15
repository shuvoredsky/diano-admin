'use client';

import { useMemo } from 'react';
import { Shield, Eye, Lock, Globe, Terminal, User, Calendar, Hash } from 'lucide-react';
import { DateText } from '@/components/shared/date-text';
import { maskSensitiveData } from '../utils/mask-sensitive';
import type { AuditLogEntry } from '../types/audit-logs.types';

export interface AuditLogDetailModalProps {
  log: AuditLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailModal({
  log,
  open,
  onOpenChange,
}: AuditLogDetailModalProps) {
  const maskedMetadata = useMemo(() => {
    if (!log?.metadata) return null;
    return maskSensitiveData(log.metadata);
  }, [log]);

  if (!open || !log) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 id="audit-detail-title" className="text-base font-bold text-foreground">
                Audit Event Detail
              </h2>
              <p className="font-mono text-xs text-muted-foreground">ID: {log.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close modal"
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Sensitive Field Masking Notice */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <Lock className="h-4 w-4 shrink-0" />
          <span>Security Notice: Passwords, tokens, cookies, and secrets are strictly redacted.</span>
        </div>

        {/* Content Body */}
        <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Grid Overview */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Actor */}
            <div className="rounded-2xl border border-border/80 bg-background/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="font-medium">Actor</span>
              </div>
              <div className="font-semibold text-foreground">
                {log.actor?.name ?? log.actorType}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {log.actor?.email ?? log.actorId ?? 'System Automated'}
              </div>
            </div>

            {/* Action */}
            <div className="rounded-2xl border border-border/80 bg-background/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Terminal className="h-3.5 w-3.5" />
                <span className="font-medium">Action</span>
              </div>
              <div>
                <span className="inline-flex rounded-lg bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                  {log.action}
                </span>
              </div>
            </div>

            {/* Target */}
            <div className="rounded-2xl border border-border/80 bg-background/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <span className="font-medium">Target Entity</span>
              </div>
              <div className="font-semibold text-foreground">{log.targetType}</div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {log.targetId ?? 'N/A'}
              </div>
            </div>

            {/* Timestamp */}
            <div className="rounded-2xl border border-border/80 bg-background/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">Timestamp (Asia/Dhaka)</span>
              </div>
              <div className="font-medium text-foreground">
                <DateText date={log.createdAt} format="datetime" showTimezone />
              </div>
            </div>
          </div>

          {/* Network & Tracing */}
          <div className="rounded-2xl border border-border/80 bg-background/50 p-3 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              <span>Network & Trace Context</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground">IP Address: </span>
                <span className="font-mono text-foreground">{log.ipAddress ?? 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Request ID: </span>
                <span className="font-mono text-foreground">{log.requestId ?? 'N/A'}</span>
              </div>
            </div>
            {log.userAgent && (
              <div className="text-[11px]">
                <span className="text-muted-foreground">User Agent: </span>
                <span className="font-mono text-muted-foreground/90 break-all">
                  {log.userAgent}
                </span>
              </div>
            )}
          </div>

          {/* Masked Metadata Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Event Payload & Metadata (Redacted)
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Eye className="h-3 w-3" />
                Sanitized JSON
              </span>
            </div>
            <pre className="max-h-64 overflow-auto rounded-2xl border border-border bg-muted/40 p-3.5 font-mono text-[11px] leading-relaxed text-foreground">
              {maskedMetadata ? JSON.stringify(maskedMetadata, null, 2) : 'No metadata attached'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
