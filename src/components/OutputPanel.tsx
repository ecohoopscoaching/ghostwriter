import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/engine/limits';
import type { ValidationResult } from '@/lib/engine/types';
import { cn } from '@/lib/utils';

interface OutputPanelProps {
  index: string;
  heading: string;
  title?: string;
  meta?: string;
  value: string;
  placeholder?: string;
  onChange: (next: string) => void;
  validation: ValidationResult;
  copyLabel: string;
  minRows?: number;
}

export function OutputPanel({
  index,
  heading,
  title,
  meta,
  value,
  placeholder,
  onChange,
  validation,
  copyLabel,
  minRows = 12,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for restricted clipboard contexts
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const isEmpty = value.trim().length === 0;
  const overLimit = validation.chars > validation.max;

  return (
    <section className="border-t border-[#262626] pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-[#a1a1aa]">
            {index} / {heading}
          </p>
          {title && (
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
          )}
          {meta && (
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-[#c0c0c0]">
              {meta}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="silver"
          size="md"
          onClick={handleCopy}
          disabled={isEmpty}
          aria-label={copyLabel}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-white" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-[#c0c0c0]" />
              {copyLabel}
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 border border-[#262626] bg-[#0a0a0a] transition-colors focus-within:border-[#c0c0c0]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={minRows}
          spellCheck={false}
          aria-label={heading}
          className="block w-full resize-y bg-transparent p-6 font-mono text-sm leading-relaxed text-[#f4f4f5] placeholder:text-[#52525b] outline-none sm:p-8 sm:text-[15px]"
        />
      </div>

      {/* Live character counter + validation status */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'font-mono text-xs font-semibold tracking-wider',
              overLimit ? 'text-white underline decoration-white underline-offset-4' : 'text-[#c0c0c0]',
            )}
            data-testid={`${heading.toLowerCase().replace(/\s+/g, '-')}-counter`}
          >
            {formatCount(validation.chars)} / {formatCount(validation.max)}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#71717a]">
            {isEmpty ? 'Ready' : overLimit ? 'Over limit' : validation.ok ? 'Valid' : 'Check format'}
          </span>
        </div>

        {!isEmpty && !validation.ok && validation.issues.length > 0 && (
          <p className="font-mono text-xs text-[#e4e4e7]">
            {validation.issues[0].message}
          </p>
        )}
      </div>
    </section>
  );
}
