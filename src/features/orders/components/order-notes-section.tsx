'use client';

import { useState } from 'react';
import type { OrderDetailEntity } from '../types/orders.types';
import { useAddOrderNoteMutation } from '../hooks/use-orders-queries';
import { PermissionGate } from '@/components/shared/permission-gate';
import { DateText } from '@/components/shared/date-text';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export interface OrderNotesSectionProps {
  order: OrderDetailEntity;
  onNoteAdded: () => void;
}

export function OrderNotesSection({ order, onNoteAdded }: OrderNotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const addNoteMutation = useAddOrderNoteMutation();

  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return;
    setNoteError(null);
    try {
      await addNoteMutation.mutateAsync({
        id: order.id,
        input: {
          note: newNote.trim(),
          isCustomerVisible,
        },
      });
      setNewNote('');
      setIsCustomerVisible(false);
      onNoteAdded();
    } catch (err: unknown) {
      setNoteError(err instanceof Error ? err.message : 'Failed to add order note');
    }
  };

  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
          <MessageSquare className="h-4 w-4 text-primary" />
          Order Notes ({order.orderNotes?.length || 0})
        </div>
      </div>

      {order.orderNotes && order.orderNotes.length > 0 ? (
        <div className="space-y-2">
          {order.orderNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-border bg-muted/15 p-3 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {note.authorId ? `Staff (${note.authorId.slice(0, 8)})` : 'Staff'}
                  </span>
                  <span
                    className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                      note.isCustomerVisible
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {note.isCustomerVisible ? 'Customer Visible' : 'Internal Note'}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  <DateText date={note.createdAt} />
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{note.note}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
          No notes recorded for this order yet.
        </div>
      )}

      <PermissionGate permissions={['order:update_status', 'order:manage']}>
        <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
          <h4 className="text-xs font-semibold text-foreground">Add Order Note</h4>
          <textarea
            value={newNote}
            onChange={(e) => {
              setNewNote(e.target.value);
              if (noteError) setNoteError(null);
            }}
            placeholder="Type order progress update, audit detail, or customer instruction..."
            className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            rows={2}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCustomerVisible}
                onChange={(e) => setIsCustomerVisible(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Visible to customer</span>
            </label>
            <Button
              type="button"
              size="sm"
              disabled={addNoteMutation.isPending || !newNote.trim()}
              onClick={handleAddNote}
            >
              {addNoteMutation.isPending ? 'Adding Note...' : 'Add Note'}
            </Button>
          </div>
          {noteError && (
            <p className="text-[11px] text-destructive font-medium">{noteError}</p>
          )}
        </div>
      </PermissionGate>
    </div>
  );
}
