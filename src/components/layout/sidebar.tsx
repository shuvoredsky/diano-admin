'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/ui.slice';
import { usePermissions } from '@/hooks/use-permissions';
import { SIDEBAR_NAV_GROUPS, type NavGroup, type NavItem } from './nav-config';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(state => state.ui.isSidebarCollapsed);
  const { hasAnyPermission, isSuperAdmin } = usePermissions();

  const isItemVisible = (item: NavItem): boolean => {
    if (isSuperAdmin) return true;
    if (!item.permissions || item.permissions.length === 0) return true;
    return hasAnyPermission(item.permissions);
  };

  const visibleGroups: NavGroup[] = SIDEBAR_NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(isItemVisible),
  })).filter(group => group.items.length > 0);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card transition-all duration-300 md:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-sm">
            D
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-foreground text-lg">DIANO</span>
                <span className="rounded-md bg-mint px-1.5 py-0.5 font-semibold text-[10px] text-primary-deep">
                  Admin
                </span>
              </div>
              <span className="truncate text-muted-foreground text-xs">E-Commerce Management</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mint/40 hover:text-foreground transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <div className="space-y-6">
          {visibleGroups.map(group => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed ? (
                <h3 className="px-3 pb-1 font-semibold text-[11px] text-muted-foreground tracking-wider uppercase">
                  {group.title}
                </h3>
              ) : (
                <div className="my-2 border-t border-border/60" />
              )}
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={isCollapsed ? item.title : undefined}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-mint text-primary-deep dark:bg-mint/30 dark:text-foreground shadow-xs font-semibold'
                            : 'text-foreground/80 hover:bg-mint/30 hover:text-foreground'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                      >
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-colors ${
                            isActive ? 'text-primary-deep dark:text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                        {!isCollapsed && item.badge && (
                          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Status */}
      {!isCollapsed && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl bg-mint/30 p-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <div className="truncate">
              <span className="font-semibold text-foreground">RBAC Enforced</span>
              <p className="text-[11px] text-muted-foreground">Asia/Dhaka GMT+6</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
