'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAppDispatch } from '@/store/hooks';
import { setMobileSidebarOpen } from '@/store/slices/ui.slice';
import { usePermissions } from '@/hooks/use-permissions';
import { useSocketLifecycle } from '@/features/auth/hooks';
import { logoutAdmin } from '@/features/auth/api/auth.api';
import { Breadcrumbs } from './breadcrumbs';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  LogOut,
  User,
  Shield,
  ChevronDown,
} from 'lucide-react';

export function Topbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const { user, isSuperAdmin, roles } = usePermissions();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const { isConnected, hasUnreadNotification, clearNotificationIndicator } = useSocketLifecycle();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } finally {
      router.push('/login');
    }
  };

  const primaryRole = isSuperAdmin
    ? 'Super Admin'
    : roles[0]
      ? roles[0].replace(/-/g, ' ').toUpperCase()
      : 'Staff';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/90 px-4 md:px-6 backdrop-blur-md">
      {/* Left side: Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mint/40 hover:text-foreground md:hidden"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right side: Global Search, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Trigger */}
        <div className="relative hidden md:block">
          <div className="flex h-9 w-64 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground shadow-2xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 truncate">Search products, orders, customers...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={clearNotificationIndicator}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mint/40 hover:text-foreground transition-colors"
            title={isConnected ? 'Real-time WebSocket connected' : 'Connecting real-time service...'}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {hasUnreadNotification && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card animate-pulse" />
            )}
          </button>
        </div>

        {/* Theme Toggle Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsThemeOpen(!isThemeOpen);
              setIsProfileOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-mint/40 hover:text-foreground transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : theme === 'system' ? (
              <Laptop className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-border bg-card p-1 shadow-lg z-50 glass-floating">
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  setIsThemeOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === 'light' ? 'bg-mint text-primary-deep font-semibold' : 'text-foreground hover:bg-muted'
                }`}
              >
                <Sun className="h-3.5 w-3.5" /> Light
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  setIsThemeOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === 'dark' ? 'bg-mint text-primary-deep font-semibold' : 'text-foreground hover:bg-muted'
                }`}
              >
                <Moon className="h-3.5 w-3.5" /> Dark
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('system');
                  setIsThemeOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === 'system' ? 'bg-mint text-primary-deep font-semibold' : 'text-foreground hover:bg-muted'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" /> System
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsThemeOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-border p-1.5 text-xs hover:bg-mint/30 transition-colors"
            aria-expanded={isProfileOpen}
            aria-label="User profile menu"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-mint text-primary-deep font-bold text-xs">
              {user?.name && user.name.length > 0 ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="hidden text-left lg:block">
              <span className="block font-semibold text-foreground leading-tight truncate max-w-[120px]">
                {user?.name || 'Staff User'}
              </span>
              <span className="block text-[10px] text-muted-foreground truncate max-w-[120px]">
                {primaryRole}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1 shadow-lg z-50 glass-floating">
              <div className="border-b border-border px-3 py-2">
                <p className="font-semibold text-foreground text-xs truncate">
                  {user?.name || 'Staff Administrator'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email || 'staff@diano.com'}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-primary font-medium">
                  <Shield className="h-3 w-3" />
                  <span>{primaryRole}</span>
                </div>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 font-medium transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
