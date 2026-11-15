import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProviders } from '@/components/providers/app-providers';
import {
  SettingsManager,
  StoreProfileForm,
  InvoiceSettingsForm,
  SeoDefaultsForm,
  ContactSettingsForm,
  type StoreProfileSettings,
  type InvoiceSettings,
  type SeoDefaultsSettings,
  type ContactSettings,
} from '@/features/cms';
import * as usePermissionsHook from '@/hooks/use-permissions';
import type * as SettingsQueriesModule from '@/features/cms/hooks/use-settings-queries';

const mockProfile: StoreProfileSettings = {
  storeName: 'DIANO Lifestyle BD',
  tagline: 'Authentic Heritage Wear',
  logo: 'https://res.cloudinary.com/diano/image/upload/logo.png',
  favicon: 'https://res.cloudinary.com/diano/image/upload/favicon.png',
  phone: '+880 1711 000000',
  email: 'official@diano.com',
  address: 'Road 11, Banani, Dhaka 1213',
  businessRegistration: 'TRAD/DNCC/001122',
  bin: '123456789-0101',
  vat: 'VAT-998877',
  socialLinks: {
    facebook: 'https://facebook.com/dianobd',
    instagram: 'https://instagram.com/dianobd',
  },
};

const mockInvoice: InvoiceSettings = {
  prefix: 'DIA',
  footerNote: 'Thank you for choosing DIANO BD.',
  termsNote: 'Exchanges valid for 7 days.',
  showLogo: true,
  signatureText: 'Authorized Signatory',
};

const mockSeo: SeoDefaultsSettings = {
  titleTemplate: '%s | DIANO Premium Heritage',
  description: 'Handcrafted luxury apparel and festive panjabis in Bangladesh.',
  ogImage: 'https://res.cloudinary.com/diano/image/upload/og.jpg',
};

const mockContact: ContactSettings = {
  supportPhone: '+880 9612 000000',
  supportEmail: 'care@diano.com',
  address: 'Banani, Dhaka',
  supportHours: 'Sat-Thu: 10am-9pm',
};

const mockUpdateSettingsMutateAsync = vi.fn();
const mockUploadLogoMutateAsync = vi.fn();
const mockUploadFaviconMutateAsync = vi.fn();

vi.mock('@/features/cms/hooks/use-settings-queries', async (importOriginal) => {
  const actual = await importOriginal<typeof SettingsQueriesModule>();
  return {
    ...actual,
    useStoreProfileQuery: vi.fn(() => ({
      data: mockProfile,
      isLoading: false,
    })),
    useInvoiceSettingsQuery: vi.fn(() => ({
      data: mockInvoice,
      isLoading: false,
    })),
    useSeoDefaultsQuery: vi.fn(() => ({
      data: mockSeo,
      isLoading: false,
    })),
    useContactSettingsQuery: vi.fn(() => ({
      data: mockContact,
      isLoading: false,
    })),
    useUpdateSettingsMutation: vi.fn(() => ({
      mutateAsync: mockUpdateSettingsMutateAsync,
      isPending: false,
    })),
    useUploadLogoMutation: vi.fn(() => ({
      mutateAsync: mockUploadLogoMutateAsync,
      isPending: false,
    })),
    useUploadFaviconMutation: vi.fn(() => ({
      mutateAsync: mockUploadFaviconMutateAsync,
      isPending: false,
    })),
  };
});

function setupPermissions(permissions: string[], isSuperAdmin = false) {
  vi.spyOn(usePermissionsHook, 'usePermissions').mockReturnValue({
    permissions,
    isSuperAdmin,
    roles: isSuperAdmin ? ['ADMIN'] : ['STAFF'],
    user: { id: 'usr-admin', email: 'admin@diano.com', name: 'Admin', roles: ['ADMIN'] },
    hasPermission: (perm: string) => isSuperAdmin || permissions.includes(perm),
    hasAnyPermission: (perms: string[]) => isSuperAdmin || perms.some((p) => permissions.includes(p)),
    hasAllPermissions: (perms: string[]) => isSuperAdmin || perms.every((p) => permissions.includes(p)),
    isLoading: false,
    isAuthenticated: true,
  });
}

describe('Phase 9A: Store Settings Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupPermissions(['settings:read', 'settings:update'], true);
  });

  describe('1. Store Profile & Brand Identity', () => {
    it('renders store profile fields, phone, email, address, and logo previews', () => {
      render(
        <AppProviders>
          <StoreProfileForm />
        </AppProviders>
      );

      expect(screen.getByDisplayValue('DIANO Lifestyle BD')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Authentic Heritage Wear')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+880 1711 000000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('official@diano.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Road 11, Banani, Dhaka 1213')).toBeInTheDocument();
      expect(screen.getByDisplayValue('TRAD/DNCC/001122')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123456789-0101')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://facebook.com/dianobd')).toBeInTheDocument();
    });

    it('submits updated store profile settings and calls mutation', async () => {
      render(
        <AppProviders>
          <StoreProfileForm />
        </AppProviders>
      );

      const storeNameInput = screen.getByLabelText(/Store Name \*/i);
      fireEvent.change(storeNameInput, { target: { value: 'DIANO Flagship House' } });

      const saveBtn = screen.getByRole('button', { name: /save profile settings/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockUpdateSettingsMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            storeName: 'DIANO Flagship House',
            email: 'official@diano.com',
          })
        );
      });
    });
  });

  describe('2. Invoice Settings Form', () => {
    it('renders prefix and validation rules for invoice numbering', async () => {
      render(
        <AppProviders>
          <InvoiceSettingsForm />
        </AppProviders>
      );

      expect(screen.getByDisplayValue('DIA')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Authorized Signatory')).toBeInTheDocument();

      const prefixInput = screen.getByLabelText(/Invoice Number Prefix \*/i);
      fireEvent.change(prefixInput, { target: { value: 'INV-2026' } });

      fireEvent.click(screen.getByRole('button', { name: /save invoice configuration/i }));

      await waitFor(() => {
        expect(mockUpdateSettingsMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            prefix: 'INV-2026',
            showLogo: true,
          })
        );
      });
    });
  });

  describe('3. SEO Defaults & Contact Settings', () => {
    it('renders SEO title template and meta description', () => {
      render(
        <AppProviders>
          <SeoDefaultsForm />
        </AppProviders>
      );

      expect(screen.getByDisplayValue('%s | DIANO Premium Heritage')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Handcrafted luxury apparel and festive panjabis in Bangladesh.')
      ).toBeInTheDocument();
    });

    it('renders Contact settings form and helplines', () => {
      render(
        <AppProviders>
          <ContactSettingsForm />
        </AppProviders>
      );

      expect(screen.getByDisplayValue('+880 9612 000000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('care@diano.com')).toBeInTheDocument();
    });
  });

  describe('4. Settings Manager Container & Security Notice', () => {
    it('renders secret safety banner emphasizing .env-only storage for payments and SMTP', () => {
      render(
        <AppProviders>
          <SettingsManager />
        </AppProviders>
      );

      expect(screen.getByText(/Infrastructure & Secret Security Standard/i)).toBeInTheDocument();
      expect(screen.getByText(/SSLCOMMERZ Store ID & Passkey/i)).toBeInTheDocument();
    });

    it('switches tabs between Profile, Invoice, SEO, and Contact', () => {
      render(
        <AppProviders>
          <SettingsManager />
        </AppProviders>
      );

      const invoiceTab = screen.getByRole('button', { name: /invoice & pdf template/i });
      fireEvent.click(invoiceTab);

      expect(screen.getByText(/Invoice & PDF Receipt Format/i)).toBeInTheDocument();
    });
  });

  describe('5. Permission Gates', () => {
    it('disables or hides submit buttons when user lacks settings:update permission', () => {
      setupPermissions(['settings:read'], false);

      render(
        <AppProviders>
          <StoreProfileForm />
        </AppProviders>
      );

      expect(screen.queryByRole('button', { name: /save profile settings/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/upload new logo/i)).not.toBeInTheDocument();
    });
  });
});
