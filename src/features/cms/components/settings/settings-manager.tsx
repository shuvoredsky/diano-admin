'use client';

import { useState } from 'react';
import { StoreProfileForm } from './store-profile-form';
import { InvoiceSettingsForm } from './invoice-settings-form';
import { SeoDefaultsForm } from './seo-defaults-form';
import { ContactSettingsForm } from './contact-settings-form';
import { ShieldCheck, Store, Receipt, Globe, PhoneCall } from 'lucide-react';

export type SettingsTab = 'store_profile' | 'invoice' | 'seo_defaults' | 'contact';

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('store_profile');

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'store_profile', label: 'Store Profile & Brand', icon: Store },
    { id: 'invoice', label: 'Invoice & PDF Template', icon: Receipt },
    { id: 'seo_defaults', label: 'SEO & OpenGraph', icon: Globe },
    { id: 'contact', label: 'Customer Care & Helplines', icon: PhoneCall },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Platform & Store Configuration</h2>
          <p className="text-xs text-muted-foreground">
            Manage branding assets, statutory registrations, invoice formats, and SEO defaults.
          </p>
        </div>
      </div>

      {/* Security notice regarding env-only credentials */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground">Infrastructure & Secret Security Standard</p>
          <p className="text-[11px] leading-relaxed">
            Payment gateway API keys (SSLCOMMERZ Store ID & Passkey), SMTP email credentials, and SMS gateway tokens are maintained strictly within server environment variables (<code className="font-mono text-foreground font-semibold">.env</code>). They are intentionally not editable via this UI to prevent credential leakage.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === 'store_profile' && <StoreProfileForm />}
        {activeTab === 'invoice' && <InvoiceSettingsForm />}
        {activeTab === 'seo_defaults' && <SeoDefaultsForm />}
        {activeTab === 'contact' && <ContactSettingsForm />}
      </div>
    </div>
  );
}
