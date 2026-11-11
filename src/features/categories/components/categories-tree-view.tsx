'use client';

import { StatusBadge } from '@/components/shared/status-badge';
import { PermissionGate } from '@/components/shared/permission-gate';
import type { CategoryItem } from '../types/categories.types';
import {
  Folder,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CategoriesTreeViewProps {
  categories: CategoryItem[];
  onEdit: (category: CategoryItem) => void;
  onAddSubcategory: (parent: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
  onOpenSpecTemplate: (category: CategoryItem) => void;
  onToggleStatus: (category: CategoryItem) => void;
  onReorder: (category: CategoryItem, direction: 'up' | 'down') => void;
}

export function CategoriesTreeView({
  categories,
  onEdit,
  onAddSubcategory,
  onDelete,
  onOpenSpecTemplate,
  onToggleStatus,
  onReorder,
}: CategoriesTreeViewProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderCategoryRow = (cat: CategoryItem, depth: number) => {
    const hasChildren = Boolean(cat.children && cat.children.length > 0);
    const isCollapsed = collapsedIds.has(cat.id);
    const canHaveChildren = depth < 3;

    return (
      <div key={cat.id} className="space-y-1">
        <div
          className={cn(
            'flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 gap-3 text-xs',
            depth === 2 && 'ml-6 border-l-4 border-l-primary/40',
            depth === 3 && 'ml-12 border-l-4 border-l-sky-500/40'
          )}
        >
          {/* Left info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleCollapse(cat.id)}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={isCollapsed ? 'Expand category' : 'Collapse category'}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            ) : (
              <div className="w-6 shrink-0" />
            )}

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {hasChildren && !isCollapsed ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">{cat.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground truncate">
                  /{cat.slug}
                </span>
                {cat.isFeatured && (
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                <span className="rounded bg-muted px-1.5 py-0.2 font-medium">
                  Level {depth} {depth === 1 ? '(Root)' : depth === 2 ? '(Subcategory)' : '(Child)'}
                </span>
                <span>•</span>
                <span>{cat.productCount ?? 0} products</span>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status toggle */}
            <button
              type="button"
              onClick={() => onToggleStatus(cat)}
              className="mr-2 cursor-pointer"
              title="Toggle active status"
            >
              <StatusBadge status={cat.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
            </button>

            {/* Reorder Buttons */}
            <PermissionGate permission="category:update">
              <div className="flex items-center border border-border rounded-lg p-0.5 mr-1">
                <button
                  type="button"
                  onClick={() => onReorder(cat, 'up')}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  title="Move Up"
                  aria-label="Move Up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onReorder(cat, 'down')}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  title="Move Down"
                  aria-label="Move Down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            </PermissionGate>

            {/* Add Subcategory */}
            {canHaveChildren && (
              <PermissionGate permission="category:create">
                <button
                  type="button"
                  onClick={() => onAddSubcategory(cat)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                  title="Add Subcategory"
                >
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Add Sub</span>
                </button>
              </PermissionGate>
            )}

            {/* Specification Template */}
            <PermissionGate permission="category:update">
              <button
                type="button"
                onClick={() => onOpenSpecTemplate(cat)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                title="Specification Template"
                aria-label="Specification Template"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>
            </PermissionGate>

            {/* Edit */}
            <PermissionGate permission="category:update">
              <button
                type="button"
                onClick={() => onEdit(cat)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                title="Edit Category"
                aria-label="Edit Category"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </PermissionGate>

            {/* Delete */}
            <PermissionGate permission="category:delete">
              <button
                type="button"
                onClick={() => onDelete(cat)}
                className="p-1.5 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Delete Category"
                aria-label="Delete Category"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Render nested children if expanded */}
        {hasChildren && !isCollapsed && (
          <div className="space-y-1">
            {cat.children!.map((child) => renderCategoryRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {categories.map((root) => renderCategoryRow(root, 1))}
    </div>
  );
}

