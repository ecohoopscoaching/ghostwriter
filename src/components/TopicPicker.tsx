import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  TOPICS,
  TOPIC_CATEGORIES,
  type TopicCategory,
  type TopicItem,
} from '@/data/topics';

interface TopicPickerProps {
  onSelectTopic: (topicText: string) => void;
}

export function TopicPicker({ onSelectTopic }: TopicPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TopicCategory | null>(null);
  const [activeTheme, setActiveTheme] = useState<TopicItem | null>(null);

  const resetDrill = () => {
    setQuery('');
    setActiveCategory(null);
    setActiveTheme(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetDrill();
  };

  const handleChooseScene = (text: string) => {
    onSelectTopic(text);
    setOpen(false);
    resetDrill();
  };

  const categoryThemes = useMemo(() => {
    if (!activeCategory) return [];
    return TOPICS.filter((t) => t.category === activeCategory.id);
  }, [activeCategory]);

  const trimmedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!trimmedQuery) return null;
    const matchedThemes = TOPICS.filter(
      (t) =>
        t.label.toLowerCase().includes(trimmedQuery) ||
        TOPIC_CATEGORIES.find((c) => c.id === t.category)?.label
          .toLowerCase()
          .includes(trimmedQuery),
    );
    const matchedScenes: Array<{ theme: TopicItem; scene: string }> = [];
    for (const theme of TOPICS) {
      for (const scene of theme.scenes) {
        if (scene.toLowerCase().includes(trimmedQuery)) {
          matchedScenes.push({ theme, scene });
        }
      }
    }
    return { matchedThemes, matchedScenes };
  }, [trimmedQuery]);

  const stepLabel = activeTheme
    ? activeTheme.label
    : activeCategory
      ? activeCategory.label
      : 'Step 1 · Pick a category';

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Browse topics"
          className="inline-flex items-center gap-2 border border-[#262626] bg-[#0a0a0a] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#c0c0c0] transition-colors hover:border-white hover:text-white cursor-pointer"
        >
          <span>Topics</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,440px)] border border-[#262626] bg-[#0a0a0a] p-0 text-white shadow-2xl"
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b border-[#262626] px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-[#71717a]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a topic (e.g. father, ghosted, burnout)…"
            aria-label="Search topics"
            className="w-full bg-transparent font-mono text-xs text-white placeholder:text-[#52525b] outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear topic search"
              className="text-[#71717a] hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Drill-down breadcrumb header (hidden while searching) */}
        {!trimmedQuery && (
          <div className="flex items-center justify-between gap-2 border-b border-[#1c1c1e] px-3.5 py-2">
            {activeTheme ? (
              <button
                type="button"
                onClick={() => setActiveTheme(null)}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa] hover:text-white cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {activeCategory?.label ?? 'Themes'}
              </button>
            ) : activeCategory ? (
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#a1a1aa] hover:text-white cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Categories
              </button>
            ) : (
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#71717a]">
                {stepLabel}
              </span>
            )}

            {(activeCategory || activeTheme) && (
              <span className="truncate font-mono text-[11px] font-semibold text-white">
                {activeTheme ? activeTheme.label : activeCategory?.label}
              </span>
            )}
          </div>
        )}

        {/* List body */}
        <div className="max-h-80 overflow-y-auto p-1.5">
          {trimmedQuery && searchResults ? (
            searchResults.matchedThemes.length === 0 &&
            searchResults.matchedScenes.length === 0 ? (
              <p className="px-3 py-6 text-center font-mono text-xs text-[#71717a]">
                No matching topics. Type your own scene directly in the box.
              </p>
            ) : (
              <div className="space-y-3">
                {searchResults.matchedThemes.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#71717a]">
                      Topics — click to see specific scenes
                    </p>
                    {searchResults.matchedThemes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          const cat =
                            TOPIC_CATEGORIES.find((c) => c.id === theme.category) ?? null;
                          setActiveCategory(cat);
                          setActiveTheme(theme);
                          setQuery('');
                        }}
                        className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-sm font-semibold text-[#e4e4e7] transition-colors hover:bg-[#18181b] hover:text-white cursor-pointer"
                      >
                        <span>{theme.label}</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#71717a]">
                          {theme.scenes.length} scenes
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.matchedScenes.length > 0 && (
                  <div>
                    <p className="px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#71717a]">
                      Specific scenes
                    </p>
                    {searchResults.matchedScenes.slice(0, 12).map(({ theme, scene }) => (
                      <button
                        key={`${theme.id}:${scene}`}
                        type="button"
                        onClick={() => handleChooseScene(scene)}
                        className="block w-full px-2.5 py-2 text-left transition-colors hover:bg-[#18181b] cursor-pointer"
                      >
                        <div className="text-xs font-medium leading-snug text-[#f4f4f5]">
                          {scene}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#71717a]">
                          {theme.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : activeTheme ? (
            /* Step 3: Specific detailed scenes under the chosen theme */
            <div className="space-y-1">
              <p className="px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#71717a]">
                Pick a specific angle
              </p>
              {activeTheme.scenes.map((scene) => (
                <button
                  key={scene}
                  type="button"
                  onClick={() => handleChooseScene(scene)}
                  className="block w-full px-2.5 py-2.5 text-left text-sm leading-snug text-[#f4f4f5] transition-colors hover:bg-[#18181b] hover:text-white cursor-pointer"
                >
                  {scene}
                </button>
              ))}
              <div className="mt-2 border-t border-[#1c1c1e] pt-1.5">
                <button
                  type="button"
                  onClick={() => handleChooseScene(activeTheme.label)}
                  className="block w-full px-2.5 py-2 text-left font-mono text-[11px] text-[#71717a] transition-colors hover:bg-[#18181b] hover:text-white cursor-pointer"
                >
                  Use broad topic: “{activeTheme.label}”
                </button>
              </div>
            </div>
          ) : activeCategory ? (
            /* Step 2: Themes inside the chosen category */
            <div className="space-y-0.5">
              {categoryThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveTheme(theme)}
                  className="flex w-full items-center justify-between gap-2 px-2.5 py-2.5 text-left text-sm font-semibold text-[#e4e4e7] transition-colors hover:bg-[#18181b] hover:text-white cursor-pointer"
                >
                  <span>{theme.label}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#71717a]" />
                </button>
              ))}
            </div>
          ) : (
            /* Step 1: 10 clean categories */
            <div className="space-y-0.5">
              {TOPIC_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className="flex w-full items-center justify-between gap-2 px-2.5 py-2.5 text-left text-sm font-semibold text-[#e4e4e7] transition-colors hover:bg-[#18181b] hover:text-white cursor-pointer"
                >
                  <span>{cat.label}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#71717a]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
