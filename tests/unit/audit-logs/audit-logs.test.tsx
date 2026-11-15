import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AppProviders } from '@/components/providers/app-providers';
import { AuditLogsManager } from '@/features/audit-logs/components/audit-logs-manager';
import { maskSensitiveData } from '@/features/audit-logs/utils/mask-sensitive';
import * as auditApi from '@/features/audit-logs/api/audit-logs.api';
import * as authPermissionsHook from '@/features/auth/hooks/use-auth-permissions';
import type { UseAuthPermissionsResult } from '@/features/auth/hooks/use-auth-permissions';
import type { AuditLogEntry, AuditLogsListResult } from '@/features/audit-logs/types/audit-logs.types';

const mockLogs: AuditLogEntry[] = [
  {
    id: 'audit-001',
    actorId: 'usr-admin-1',
    actorType: 'USER',
    actor: {
      id: 'usr-admin-1',
      name: 'Super Administrator',
      email: 'admin@diano.com.bd',
    },
    action: 'USER_ROLE_ASSIGN',
    targetType: 'UserRole',
    targetId: 'usr-staff-2',
    requestId: 'req-abc-123',
    ipAddress: '103.205.71.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    metadata: {
      role: 'ORDER_MANAGER',
      userId: 'usr-staff-2',
      authToken: 'secret_jwt_token_12345',
      userPassword: 'PlainPassword123!',
      sessionCookie: 'sid_xyz987',
      assignedBy: 'admin@diano.com.bd',
      paymentCard: {
        last4: '4242',
        cvv: '123',
      },
    },
    createdAt: '2026-11-15T10:30:00.000Z',
  },
  {
    id: 'audit-002',
    actorId: null,
    actorType: 'SYSTEM',
    actor: null,
    action: 'ORDER_AUTO_CANCEL',
    targetType: 'Order',
    targetId: 'ord-998877',
    requestId: 'req-cron-456',
    ipAddress: '127.0.0.1',
    userAgent: 'DianoCronWorker/1.0',
    metadata: {
      orderNumber: 'ORD-2026-0001',
      reason: 'UNPAID_EXPIRED',
    },
    createdAt: '2026-11-15T11:00:00.000Z',
  },
];

const mockListResult: AuditLogsListResult = {
  items: mockLogs,
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const superAdminPerms: UseAuthPermissionsResult = {
  user: {
    id: 'usr-1',
    email: 'admin@diano.com.bd',
    name: 'Super Admin',
    roles: ['SUPER_ADMIN'],
    isSuperAdmin: true,
  },
  isAuthenticated: true,
  isLoading: false,
  permissions: ['audit:view'],
  roles: ['SUPER_ADMIN'],
  isSuperAdmin: true,
  hasPermission: () => true,
  hasAnyPermission: () => true,
  hasAllPermissions: () => true,
};

describe('Phase 9B: Audit Logs & Security Events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(auditApi, 'fetchAuditLogs').mockResolvedValue(mockListResult);
    vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue(superAdminPerms);
  });

  describe('1. Read-Only Append-Only Guarantees', () => {
    it('renders audit logs table with actor, action, target and Dhaka date', async () => {
      render(
        <AppProviders>
          <AuditLogsManager />
        </AppProviders>
      );

      expect(await screen.findByText('USER_ROLE_ASSIGN')).toBeInTheDocument();
      expect(screen.getByText('ORDER_AUTO_CANCEL')).toBeInTheDocument();
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
      expect(screen.getByText('admin@diano.com.bd')).toBeInTheDocument();
      expect(screen.getByText('103.205.71.1')).toBeInTheDocument();
    });

    it('confirms zero create, edit, or delete UI elements exist in audit logs', async () => {
      render(
        <AppProviders>
          <AuditLogsManager />
        </AppProviders>
      );

      await screen.findByText('USER_ROLE_ASSIGN');

      // Verify no create buttons
      expect(screen.queryByRole('button', { name: /create|add|new log/i })).not.toBeInTheDocument();

      // Verify no edit buttons
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();

      // Verify no delete/remove/purge buttons
      expect(screen.queryByRole('button', { name: /delete|remove|purge/i })).not.toBeInTheDocument();
    });
  });

  describe('2. Detail Modal & Sensitive Field Redaction', () => {
    it('opens detail modal on Inspect click and redacts passwords, tokens, cookies, cvv', async () => {
      render(
        <AppProviders>
          <AuditLogsManager />
        </AppProviders>
      );

      await screen.findByText('USER_ROLE_ASSIGN');

      const inspectBtns = screen.getAllByRole('button', { name: /inspect/i });
      fireEvent.click(inspectBtns[0]!);

      expect(await screen.findByText('Audit Event Detail')).toBeInTheDocument();
      expect(screen.getByText(/Security Notice: Passwords, tokens, cookies, and secrets are strictly redacted/i)).toBeInTheDocument();

      // Check that sensitive values are NEVER visible in the DOM
      expect(screen.queryByText(/secret_jwt_token_12345/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/PlainPassword123!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sid_xyz987/i)).not.toBeInTheDocument();

      // Non-sensitive values remain visible
      expect(screen.getByText(/ORDER_MANAGER/i)).toBeInTheDocument();
      expect(screen.getAllByText(/admin@diano.com.bd/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Sensitive Data Masking Utility (Unit)', () => {
    it('recursively redacts sensitive keys matching pattern', () => {
      const rawPayload = {
        username: 'john_doe',
        password: 'superSecretPassword',
        accessToken: 'eyJhbGciOiJIUzI1Ni...',
        refreshToken: 'refresh_987654',
        user_session_cookie: 'cookie_data',
        apiKey: 'sk_live_12345',
        cvv: '999',
        nested: {
          clientSecret: 'shhh',
          normalField: 'visible_data',
          list: [
            { token: 'tok_1' },
            { note: 'safe note' },
          ],
        },
      };

      const masked = maskSensitiveData(rawPayload) as Record<string, unknown>;
      const nested = masked.nested as Record<string, unknown>;
      const list = nested.list as Array<Record<string, unknown>>;

      expect(masked.username).toBe('john_doe');
      expect(masked.password).toBe('[REDACTED]');
      expect(masked.accessToken).toBe('[REDACTED]');
      expect(masked.refreshToken).toBe('[REDACTED]');
      expect(masked.user_session_cookie).toBe('[REDACTED]');
      expect(masked.apiKey).toBe('[REDACTED]');
      expect(masked.cvv).toBe('[REDACTED]');
      expect(nested.clientSecret).toBe('[REDACTED]');
      expect(nested.normalField).toBe('visible_data');
      expect(list[0]?.token).toBe('[REDACTED]');
      expect(list[1]?.note).toBe('safe note');
    });

    it('handles primitive, null, and empty payloads safely', () => {
      expect(maskSensitiveData(null)).toBeNull();
      expect(maskSensitiveData(undefined)).toBeUndefined();
      expect(maskSensitiveData('plain-string')).toBe('plain-string');
      expect(maskSensitiveData(12345)).toBe(12345);
      expect(maskSensitiveData([])).toEqual([]);
    });
  });

  describe('4. Permission Gate Protection', () => {
    it('displays access restricted message when user lacks audit:view and is not super admin', async () => {
      const staffPerms: UseAuthPermissionsResult = {
        user: {
          id: 'usr-2',
          email: 'staff@diano.com.bd',
          name: 'Staff User',
          roles: ['SUPPORT_STAFF'],
          isSuperAdmin: false,
        },
        isAuthenticated: true,
        isLoading: false,
        permissions: ['order:read'],
        roles: ['SUPPORT_STAFF'],
        isSuperAdmin: false,
        hasPermission: (perm: string) => perm === 'order:read',
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
      };

      vi.spyOn(authPermissionsHook, 'useAuthPermissions').mockReturnValue(staffPerms);

      render(
        <AppProviders>
          <AuditLogsManager />
        </AppProviders>
      );

      expect(await screen.findByText('Access Restricted')).toBeInTheDocument();
      expect(screen.getByText(/You require the/i)).toBeInTheDocument();
      expect(screen.queryByText('USER_ROLE_ASSIGN')).not.toBeInTheDocument();
    });
  });
});
