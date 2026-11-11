'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMobileSidebarOpen } from '@/store/slices/ui.slice';
import { usePermissions } from '@/hooks/use-permissions';
import { SIDEBAR_NAV_GROUPS, type NavItem } from './nav-config';
import { X, ShieldCheck } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.isMobileSidebarOpen);
  const { hasAnyPermission, isSuperAdmin } = usePermissions();

  useEffect(() => {
    dispatch(setMobileSidebarOpen(false));
  }, [pathname, dispatch]);

  if (!isOpen) return null;

  const isItemVisible = (item: NavItem): boolean => {
    if (isSuperAdmin) return true;
    if (!item.permissions || item.permissions.length === 0) return true;
    return hasAnyPermission(item.permissions);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => dispatch(setMobileSidebarOpen(false))}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-card shadow-2xl transition-transform duration-300">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg">
              D
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground">DIANO</span>
              <span className="text-[10px] text-muted-foreground">Admin Portal</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-mint/40 hover:text-foreground"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {SIDEBAR_NAV_GROUPS.map(group => {
              const visibleItems = group.items.filter(isItemVisible);
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  <h4 className="px-2 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                    {group.title}
                  </h4>
                  <ul className="space-y-1">
                    {visibleItems.map(item => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/admin'
                          ? pathname === '/admin'
                          : pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-mint text-primary-deep font-semibold shadow-xs'
                                : 'text-foreground/80 hover:bg-mint/30 hover:text-foreground'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 shrink-0 ${
                                isActive ? 'text-primary-deep' : 'text-muted-foreground'
                              }`}
                            />
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-xl bg-mint/30 p-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Asia/Dhaka GMT+6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
