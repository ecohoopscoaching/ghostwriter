import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface PickerOption {
  id: string;
  label: string;
  sublabel?: string;
  searchText?: string;
  group?: string;
}

export interface PickerGroup {
  id: string;
  label: string;
}

interface PickerProps {
  label: string;
  /** Single-select value */
  value?: string;
  /** Multi-select values (up to maxSelect) */
  values?: string[];
  maxSelect?: number;
  displayValue: string;
  displaySublabel?: string;
  options: PickerOption[];
  groups?: readonly PickerGroup[];
  searchable?: boolean;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  customPrefix?: string;
  customActionLabel?: (query: string) => string;
  prominent?: boolean;
  compact?: boolean;
  isPlaceholder?: boolean;
  highlightError?: boolean;
  onSelect?: (id: string) => void;
  onToggle?: (id: string) => void;
  onClear?: () => void;
}

export function Picker({
  label,
  value,
  values,
  maxSelect,
  displayValue,
  displaySublabel,
  options,
  groups,
  searchable = true,
  searchPlaceholder = 'Search…',
  allowCustom = false,
  customPrefix = 'custom:',
  customActionLabel,
  prominent = false,
  compact = false,
  isPlaceholder = false,
  highlightError = false,
  onSelect,
  onToggle,
  onClear,
}: PickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const isMulti = Array.isArray(values) && typeof onToggle === 'function';

  const handleItemAction = (id: string) => {
    if (isMulti && onToggle) {
      onToggle(id);
      return;
    }
    onSelect?.(id);
    setOpen(false);
    setQuery('');
  };

  const trimmedQuery = query.trim();

  const renderItem = (opt: PickerOption) => {
    const selected = isMulti ? values.includes(opt.id) : opt.id === value;
    return (
      <CommandItem
        key={opt.id}
        value={`${opt.label} ${opt.sublabel ?? ''} ${opt.searchText ?? ''}`}
        onSelect={() => handleItemAction(opt.id)}
      >
        <div className="min-w-0 flex-1">
          <div className={cn('font-semibold tracking-tight', selected ? 'text-white' : 'text-[#e4e4e7]')}>
            {opt.label}
          </div>
          {opt.sublabel && (
            <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#a1a1aa]">
              {opt.sublabel}
            </div>
          )}
        </div>
        {selected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />}
      </CommandItem>
    );
  };

  return (
    <div className={compact ? 'inline-block' : 'relative w-full'}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {compact ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-[#3f3f46] bg-[#0a0a0a] px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#c0c0c0] transition-colors hover:border-white hover:text-white focus-visible:border-white outline-none cursor-pointer"
              aria-label={label}
            >
              <span>{displayValue}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 text-[#a1a1aa] transition-transform duration-150',
                  open && 'rotate-180 text-white',
                )}
              />
            </button>
          ) : (
            <button
              type="button"
              className={cn(
                'group flex w-full flex-col items-start text-left transition-colors outline-none cursor-pointer',
                'border-b border-[#262626] pb-3.5 hover:border-[#c0c0c0] focus-visible:border-white',
                prominent && 'border border-[#262626] bg-[#0a0a0a] p-5 hover:border-[#c0c0c0] focus-visible:border-white',
                highlightError && 'border-white',
              )}
              aria-label={label}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa] transition-colors group-hover:text-[#e4e4e7]">
                {label}
              </span>
              <div className="mt-2 flex w-full items-center justify-between gap-3">
                <span
                  className={cn(
                    'truncate font-black tracking-tight',
                    isPlaceholder ? 'text-[#71717a]' : 'text-white',
                    prominent ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
                  )}
                >
                  {displayValue}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-[#c0c0c0] transition-transform duration-150',
                    open && 'rotate-180 text-white',
                  )}
                />
              </div>
              {displaySublabel && (
                <span className="mt-1.5 line-clamp-1 text-xs text-[#71717a]">
                  {displaySublabel}
                </span>
              )}
            </button>
          )}
        </PopoverTrigger>

        <PopoverContent align={compact ? 'end' : 'start'} className={prominent || compact ? 'w-[min(92vw,460px)]' : 'w-[min(92vw,380px)]'}>
          <Command>
            {searchable && (
              <CommandInput
                placeholder={searchPlaceholder}
                value={query}
                onValueChange={setQuery}
              />
            )}
            {isMulti && maxSelect && (
              <div className="flex items-center justify-between border-b border-[#262626] px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#a1a1aa]">
                <span>Select up to {maxSelect}</span>
                <span className="text-white">
                  {values.length} / {maxSelect}
                </span>
              </div>
            )}
            <CommandList>
              <CommandEmpty>
                {allowCustom && trimmedQuery ? (
                  <button
                    type="button"
                    onClick={() => handleItemAction(`${customPrefix}${trimmedQuery}`)}
                    className="mx-auto block border border-[#3f3f46] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:border-white cursor-pointer"
                  >
                    {customActionLabel ? customActionLabel(trimmedQuery) : `Use “${trimmedQuery}”`}
                  </button>
                ) : (
                  'No matches.'
                )}
              </CommandEmpty>

              {groups
                ? groups.map((g) => {
                    const groupItems = options.filter((o) => o.group === g.id);
                    if (!groupItems.length) return null;
                    return (
                      <CommandGroup key={g.id} heading={g.label}>
                        {groupItems.map(renderItem)}
                      </CommandGroup>
                    );
                  })
                : options.map(renderItem)}

              {allowCustom && trimmedQuery && (
                <CommandGroup heading="Custom">
                  <CommandItem
                    value={`custom ${trimmedQuery}`}
                    onSelect={() => handleItemAction(`${customPrefix}${trimmedQuery}`)}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-[#c0c0c0]">
                      {customActionLabel ? customActionLabel(trimmedQuery) : `Use custom: “${trimmedQuery}”`}
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {!compact && onClear && !isPlaceholder && Boolean(value) && (
        <button
          type="button"
          aria-label={`Clear ${label}`}
          title={`Clear ${label}`}
          onClick={onClear}
          className={cn(
            'absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center border border-[#262626] bg-black text-[#a1a1aa] transition-colors hover:border-white hover:text-white cursor-pointer',
            !prominent && 'right-0 top-0',
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
