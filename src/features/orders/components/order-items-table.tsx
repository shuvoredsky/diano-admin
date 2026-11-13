'use client';

import type { OrderDetailEntity } from '../types/orders.types';
import { MoneyText } from '@/components/shared/money-text';
import { usePermissions } from '@/hooks/use-permissions';

export interface OrderItemsTableProps {
  order: OrderDetailEntity;
}

export function OrderItemsTable({ order }: OrderItemsTableProps) {
  const { hasPermission } = usePermissions();
  const canViewCost = hasPermission('order:view_cost');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Order Items ({order.items?.length || 0})
        </h3>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3">Product / SKU</th>
              <th className="p-3 text-right">Unit Price</th>
              {canViewCost && (
                <th className="p-3 text-right" data-testid="th-cost-price">
                  Unit Cost
                </th>
              )}
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">Discount</th>
              <th className="p-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.items?.map((item, idx) => (
              <tr key={item.id || `item-${idx}`} className="hover:bg-muted/10">
                <td className="p-3">
                  <span className="font-semibold text-foreground block">
                    {item.productName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.variantName} &bull;{' '}
                    <span className="font-mono">{item.sku}</span>
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-muted-foreground">
                  <MoneyText amount={item.unitPrice} />
                </td>
                {canViewCost && (
                  <td
                    className="p-3 text-right font-mono text-muted-foreground"
                    data-testid="item-cost-price"
                  >
                    {item.costPrice != null ? (
                      <MoneyText amount={item.costPrice} />
                    ) : (
                      '—'
                    )}
                  </td>
                )}
                <td className="p-3 text-center font-bold text-foreground">
                  {item.quantity}
                </td>
                <td className="p-3 text-right font-mono text-muted-foreground">
                  <MoneyText amount={item.discount} />
                </td>
                <td className="p-3 text-right font-mono font-semibold text-foreground">
                  <MoneyText amount={item.lineTotal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-end pt-2">
        <div className="w-full sm:w-72 space-y-1.5 rounded-xl border border-border bg-muted/20 p-4 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">
              <MoneyText amount={order.subtotal} />
            </span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Discount Total</span>
              <span className="font-mono">
                -<MoneyText amount={order.discountTotal} />
              </span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping Fee</span>
            <span className="font-mono">
              <MoneyText amount={order.shippingTotal} />
            </span>
          </div>
          {Number(order.taxTotal) > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax / VAT</span>
              <span className="font-mono">
                <MoneyText amount={order.taxTotal} />
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
            <span>Grand Total</span>
            <span className="font-black text-primary-deep dark:text-primary">
              <MoneyText amount={order.grandTotal} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
