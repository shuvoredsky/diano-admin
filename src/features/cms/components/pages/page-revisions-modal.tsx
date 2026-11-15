'use client';

import { useState } from 'react';
import { X, History, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateText } from '@/components/shared/date-text';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import type { PageEntity, PageRevisionEntity } from '../../types/pages.types';
import { usePageRevisionsQuery, useRestorePageRevisionMutation } from '../../hooks/use-pages-queries';
import { usePermissions } from '@/hooks/use-permissions';

export interface PageRevisionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: PageEntity | null;
}

export function PageRevisionsModal({ open, onOpenChange, page }: PageRevisionsModalProps) {
  const { data: revisions, isLoading } = usePageRevisionsQuery(page?.id);
  const restoreMutation = useRestorePageRevisionMutation();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('page:manage');

  const [selectedRevision, setSelectedRevision] = useState<PageRevisionEntity | null>(null);
  const [revisionToRestore, setRevisionToRestore] = useState<PageRevisionEntity | null>(null);

  if (!open || !page) return null;

  const handleConfirmRestore = async () => {
    if (!revisionToRestore) return;
    try {
      await restoreMutation.mutateAsync({ id: page.id, version: revisionToRestore.version });
      setRevisionToRestore(null);
      onOpenChange(false);
    } catch {
      // Handled via mutation state
    }
  };

  const getRevisionRichText = (rev: PageRevisionEntity) => {
    const block = rev.content?.find((b) => b.type === 'richText');
    return block && 'html' in block ? String(block.html) : 'No content saved for this revision.';
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[88vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Revision History: {page.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Current Live Version: <span className="font-mono font-semibold text-primary">v{page.currentVersion}</span>
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : !revisions || revisions.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
              No previous revisions recorded yet for this page.
            </div>
          ) : (
            <div className="space-y-3">
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/50 p-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        v{rev.version}
                      </span>
                      {rev.version === page.currentVersion && (
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20">
                          Current Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Created: <DateText date={rev.createdAt} format="long" />
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRevision(rev)}
                      className="h-8 gap-1 text-xs cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                    {canManage && rev.version !== page.currentVersion && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRevisionToRestore(rev)}
                        className="h-8 gap-1 text-xs cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Rollback
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Revision Preview Drawer / Card */}
          {selectedRevision && (
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Preview Content (v{selectedRevision.version}):
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRevision(null)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-background p-3 text-xs text-muted-foreground font-mono">
                {getRevisionRichText(selectedRevision)}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(revisionToRestore)}
        onOpenChange={(isOpen) => !isOpen && setRevisionToRestore(null)}
        title="Rollback Page Revision"
        description={`Are you sure you want to rollback "${page.title}" to version v${revisionToRestore?.version}? This will overwrite the live content with the selected historical snapshot.`}
        confirmLabel="Confirm Rollback"
        variant="primary"
        onConfirm={handleConfirmRestore}
      />
    </>
  );
}
