'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { DateText } from '@/components/shared/date-text';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, History, Send, EyeOff } from 'lucide-react';
import type { PageEntity } from '../../types/pages.types';
import { PAGE_STATUS_CONFIG } from '../../constants/pages.constants';
import {
  usePublishPageMutation,
  useUnpublishPageMutation,
  useDeletePageMutation,
} from '../../hooks/use-pages-queries';
import { usePermissions } from '@/hooks/use-permissions';

interface PagesTableProps {
  data: PageEntity[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onEdit: (page: PageEntity) => void;
  onViewRevisions: (page: PageEntity) => void;
}

export function PagesTable({
  data,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onViewRevisions,
}: PagesTableProps) {
  const [pageToDelete, setPageToDelete] = useState<PageEntity | null>(null);
  const publishMutation = usePublishPageMutation();
  const unpublishMutation = useUnpublishPageMutation();
  const deleteMutation = useDeletePageMutation();

  const { hasPermission } = usePermissions();
  const canManage = hasPermission('page:manage');

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      await deleteMutation.mutateAsync(pageToDelete.id);
      setPageToDelete(null);
    } catch {
      // Handled via mutation state
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 w-full rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs">
        <EmptyState
          title="No pages found"
          description="Create your first legal or informational storefront page above."
        />
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Page Title & URL Slug</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((p) => {
                const statusMeta = PAGE_STATUS_CONFIG[p.status] || PAGE_STATUS_CONFIG.DRAFT;
                const isPublished = p.status === 'PUBLISHED';

                return (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground text-xs">{p.title}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">/{p.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-0.5 text-[10px] font-medium text-foreground">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-medium border ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                      v{p.currentVersion}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      <DateText date={p.updatedAt} format="short" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewRevisions(p)}
                          title="View revision history"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>

                        {canManage && (
                          <>
                            {isPublished ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={unpublishMutation.isPending}
                                onClick={() => unpublishMutation.mutate(p.id)}
                                title="Unpublish page (set to Draft)"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-600 cursor-pointer"
                              >
                                <EyeOff className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={publishMutation.isPending}
                                onClick={() => publishMutation.mutate(p.id)}
                                title="Publish page"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-600 cursor-pointer"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(p)}
                              title="Edit page"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPageToDelete(p)}
                              title="Delete page"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{data.length}</strong> of{' '}
            <strong className="text-foreground">{total}</strong> pages
          </span>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 text-xs cursor-pointer"
            >
              Previous
            </Button>
            <span className="px-1 text-xs">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 text-xs cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pageToDelete)}
        onOpenChange={(isOpen) => !isOpen && setPageToDelete(null)}
        title="Delete Storefront Page"
        description={`Are you sure you want to delete "${pageToDelete?.title}"? This page will become immediately inaccessible to customers.`}
        confirmLabel="Delete Page"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
