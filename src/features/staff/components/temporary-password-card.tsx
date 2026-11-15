'use client';

import { useState } from 'react';
import { Key, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface TemporaryPasswordCardProps {
  temporaryPassword: string;
  onDone: () => void;
}

export function TemporaryPasswordCard({
  temporaryPassword,
  onDone,
}: TemporaryPasswordCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback handled by OS or select-all
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
        <div className="flex items-start gap-2.5">
          <Key className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Temporary Password Generated</p>
            <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-400/90">
              This temporary password is displayed <strong>only once</strong> and cannot be retrieved later. Copy it now and provide it to the staff member securely.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Temporary Password</Label>
        <div className="flex items-center gap-2">
          <code
            data-testid="temporary-password-value"
            className="flex-1 rounded-xl border border-border bg-muted/60 px-3 py-2 text-sm font-mono tracking-wider select-all"
          >
            {temporaryPassword}
          </code>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-9 px-3 text-xs gap-1.5 shrink-0"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          type="button"
          size="sm"
          onClick={onDone}
          className="h-8 text-xs"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
