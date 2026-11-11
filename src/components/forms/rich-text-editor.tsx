'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Code,
  Eye,
  Edit3,
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content here (Markdown / HTML supported)...',
  minHeight = '180px',
  disabled = false,
}: RichTextEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const updated = value.substring(0, start) + replacement + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      );
    }, 0);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
      {/* Toolbar & Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertText('**', '**')}
            disabled={disabled || tab === 'preview'}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText('*', '*')}
            disabled={disabled || tab === 'preview'}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText('## ')}
            disabled={disabled || tab === 'preview'}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText('- ')}
            disabled={disabled || tab === 'preview'}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText('> ')}
            disabled={disabled || tab === 'preview'}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText('`', '`')}
            disabled={disabled || tab === 'preview'}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Code inline"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={tab === 'write' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTab('write')}
            className="h-7 gap-1 px-2.5 text-xs rounded-md"
          >
            <Edit3 className="h-3 w-3" /> Write
          </Button>
          <Button
            type="button"
            variant={tab === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTab('preview')}
            className="h-7 gap-1 px-2.5 text-xs rounded-md"
          >
            <Eye className="h-3 w-3" /> Preview
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{ minHeight }}
          className="w-full resize-y bg-background p-4 text-xs md:text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden"
        />
      ) : (
        <div
          style={{ minHeight }}
          className="p-4 text-sm text-foreground prose dark:prose-invert max-w-none bg-background overflow-auto"
        >
          {value ? (
            <div className="whitespace-pre-wrap">{value}</div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Nothing to preview yet.</span>
          )}
        </div>
      )}
    </div>
  );
}
