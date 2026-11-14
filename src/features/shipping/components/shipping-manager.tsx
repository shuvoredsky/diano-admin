'use client';

import { useState } from 'react';
import { MapPin, Truck, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useShippingZonesQuery, useShippingMethodsQuery } from '../hooks/use-shipping-queries';
import { ZonesList } from './zones-list';
import { MethodsTable } from './methods-table';
import { ZoneFormModal } from './zone-form-modal';
import { MethodFormModal } from './method-form-modal';
import type { ShippingZoneEntity, ShippingMethodEntity } from '../types/shipping.types';

type ShippingTab = 'zones' | 'methods';

export function ShippingManager() {
  const [activeTab, setActiveTab] = useState<ShippingTab>('zones');
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZoneEntity | null>(null);

  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethodEntity | null>(null);

  const { data: zones = [], isLoading: isLoadingZones } = useShippingZonesQuery();
  const { data: methods = [], isLoading: isLoadingMethods } = useShippingMethodsQuery();

  const handleOpenCreateZone = () => {
    setEditingZone(null);
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZone = (zone: ShippingZoneEntity) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleOpenCreateMethod = () => {
    setEditingMethod(null);
    setIsMethodModalOpen(true);
  };

  const handleOpenEditMethod = (method: ShippingMethodEntity) => {
    setEditingMethod(method);
    setIsMethodModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping & Logistics"
        description="Configure Bangladesh delivery zones, courier charges, per-kg rates, and delivery time estimates."
        actions={
          <PermissionGate permission="shipping:manage">
            {activeTab === 'zones' ? (
              <Button size="sm" onClick={handleOpenCreateZone} className="gap-1.5 cursor-pointer">
                <Plus className="h-4 w-4" />
                Add Delivery Zone
              </Button>
            ) : (
              <Button size="sm" onClick={handleOpenCreateMethod} className="gap-1.5 cursor-pointer">
                <Plus className="h-4 w-4" />
                Add Shipping Method
              </Button>
            )}
          </PermissionGate>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('zones')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'zones'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Delivery Zones ({zones.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('methods')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'methods'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Shipping Methods ({methods.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'zones' ? (
        <ZonesList
          zones={zones}
          isLoading={isLoadingZones}
          onEditZone={handleOpenEditZone}
          onCreateZone={handleOpenCreateZone}
        />
      ) : (
        <MethodsTable
          methods={methods}
          isLoading={isLoadingMethods}
          onEditMethod={handleOpenEditMethod}
          onCreateMethod={handleOpenCreateMethod}
        />
      )}

      {/* Modals */}
      <ZoneFormModal
        isOpen={isZoneModalOpen}
        onClose={() => {
          setIsZoneModalOpen(false);
          setEditingZone(null);
        }}
        zone={editingZone}
      />

      <MethodFormModal
        isOpen={isMethodModalOpen}
        onClose={() => {
          setIsMethodModalOpen(false);
          setEditingMethod(null);
        }}
        method={editingMethod}
        zones={zones}
      />
    </div>
  );
}

