import type { PermissionItem } from '../types/roles.types';

export interface ModulePermissionSectionProps {
  moduleName: string;
  perms: PermissionItem[];
  selectedSlugs: Set<string>;
  isRoleSuperAdmin: boolean;
  canUpdate: boolean;
  onToggleSlug: (slug: string) => void;
  onSelectAll: (slugs: string[], select: boolean) => void;
}

export function ModulePermissionSection({
  moduleName,
  perms,
  selectedSlugs,
  isRoleSuperAdmin,
  canUpdate,
  onToggleSlug,
  onSelectAll,
}: ModulePermissionSectionProps) {
  const permSlugs = perms.map((p) => p.slug);
  const selectedCount = isRoleSuperAdmin
    ? perms.length
    : perms.filter((p) => selectedSlugs.has(p.slug)).length;
  const allSelected = selectedCount === perms.length;

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-xs">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs capitalize text-foreground">
            {moduleName}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {selectedCount} / {perms.length}
          </span>
        </div>

        {!isRoleSuperAdmin && canUpdate && (
          <button
            type="button"
            onClick={() => onSelectAll(permSlugs, !allSelected)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-4">
        {perms.map((perm) => {
          const isChecked = isRoleSuperAdmin || selectedSlugs.has(perm.slug);

          return (
            <label
              key={perm.id}
              className={`flex items-start gap-2.5 rounded-xl border p-2.5 transition-colors cursor-pointer select-none ${
                isChecked
                  ? 'border-primary/30 bg-primary/5 text-foreground'
                  : 'border-border bg-background/50 text-muted-foreground hover:bg-muted/20'
              } ${isRoleSuperAdmin || !canUpdate ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={isRoleSuperAdmin || !canUpdate}
                onChange={() => onToggleSlug(perm.slug)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
              />
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-semibold leading-tight line-clamp-1">
                  {perm.name}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground line-clamp-1">
                  {perm.slug}
                </div>
                {perm.description && (
                  <p className="text-[10px] text-muted-foreground/80 line-clamp-1">
                    {perm.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
