'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { BannersManager } from './banners/banners-manager';
import { PagesManager } from './pages/pages-manager';
import { SettingsManager } from './settings/settings-manager';
import { ImageIcon, FileText, Settings, Sparkles } from 'lucide-react';

export type CmsTab = 'banners' | 'pages' | 'settings';

export function CmsManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab: CmsTab = (searchParams.get('tab') as CmsTab) || 'banners';

  const handleTabChange = (tab: CmsTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    // Reset page pagination parameter when switching major tabs
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const tabs: { id: CmsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'banners', label: 'Promotional Banners', icon: ImageIcon },
    { id: 'pages', label: 'Static Pages & Legal', icon: FileText },
    { id: 'settings', label: 'Store Branding & Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management & Store Branding"
        description="Configure promotional hero carousels, statutory policies, informational pages, and site identity."
      />

      {/* Feature Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Informational badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          <span>Real-time CMS & Dhaka Timezone Scheduler</span>
        </div>
      </div>

      {/* Active Manager View */}
      <div>
        {activeTab === 'banners' && <BannersManager />}
        {activeTab === 'pages' && <PagesManager />}
        {activeTab === 'settings' && <SettingsManager />}
      </div>
    </div>
  );
}
