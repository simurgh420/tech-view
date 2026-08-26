// AttributeSelectorDialog.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Search, X, ArrowRight, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORIES, getCategoryMeta, type AttributeSelectorItem } from './attribute-category';

interface AttributeSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributes: AttributeSelectorItem[];
  isSubmitting?: boolean;
  onSubmit: (attributeIds: string[]) => Promise<void>;
}

const TYPE_LABEL: Record<string, string> = {
  TEXT: 'متنی',
  NUMBER: 'عددی',
  BOOLEAN: 'بله / خیر',
  ENUM: 'انتخابی',
};

const TYPE_STYLE: Record<string, string> = {
  TEXT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  NUMBER: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  BOOLEAN: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  ENUM: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
};

export function AttributeSelectorDialog({
  open,
  onOpenChange,
  attributes,
  isSubmitting = false,
  onSubmit,
}: AttributeSelectorDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
      setSearch('');
      setSelectedIds([]);
      setActiveCategory('all');
    };
  }, [open]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredAttributes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return attributes.filter(attribute => {
      if (activeCategory !== 'all' && attribute.category !== activeCategory) {
        return false;
      }
      if (!query) return true;
      const label = attribute.label.toLocaleLowerCase();
      const key = attribute.key.toLocaleLowerCase();
      return label.includes(query) || key.includes(query);
    });
  }, [attributes, search, activeCategory]);

  const selectedAttributes = useMemo(
    () => attributes.filter(attribute => selectedSet.has(attribute.id)),
    [attributes, selectedSet]
  );

  const allFilteredSelected =
    filteredAttributes.length > 0 &&
    filteredAttributes.every(attribute => selectedSet.has(attribute.id));

  function toggleAttribute(id: string) {
    if (isSubmitting) return;
    setSelectedIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  }

  function toggleAllFiltered() {
    if (isSubmitting || filteredAttributes.length === 0) return;
    setSelectedIds(current => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredAttributes.forEach(attribute => next.delete(attribute.id));
      } else {
        filteredAttributes.forEach(attribute => next.add(attribute.id));
      }
      return Array.from(next);
    });
  }

  function clearSelection() {
    if (isSubmitting) return;
    setSelectedIds([]);
  }

  async function handleSubmit() {
    if (selectedIds.length === 0 || isSubmitting) return;
    await onSubmit(selectedIds);
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex flex-col bg-background text-foreground overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* HEADER */}
      <header className="shrink-0 border-b bg-linear-to-b from-card to-card/90 px-6 py-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <ArrowRight className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">مدیریت و افزودن مشخصات فنی</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                مشخصه‌ها را از دسته‌بندی‌های مختلف انتخاب کرده و به محصول اضافه کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
              <strong className="text-foreground text-base px-1">{selectedIds.length}</strong>
              مورد انتخاب شده
            </span>
            <Button
              disabled={selectedIds.length === 0 || isSubmitting}
              onClick={() => void handleSubmit()}
              className="min-w-37.5 font-semibold shadow-sm"
            >
              {isSubmitting ? 'در حال ثبت...' : 'تایید و افزودن مشخصات'}
            </Button>
          </div>
        </div>

        {/* SEARCH & SELECT ALL BAR */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="جستجوی سریع بین تمام مشخصات (نام یا کلید انگلیسی مثل ram_speed)..."
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl border border-input bg-background/80 pr-12 pl-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={toggleAllFiltered}
            disabled={isSubmitting || filteredAttributes.length === 0}
            className="h-11 px-5 text-xs font-semibold whitespace-nowrap"
          >
            {allFilteredSelected ? (
              <>
                <Square className="ml-1.5 size-4" /> لغو انتخاب این لیست
              </>
            ) : (
              <>
                <CheckSquare className="ml-1.5 size-4" /> انتخاب همه نتایج (
                {filteredAttributes.length})
              </>
            )}
          </Button>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 custom-scrollbar">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all shrink-0 border',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  isActive
                    ? `${cat.border} ${cat.bg} ${cat.color} shadow-sm`
                    : 'border-border/60 bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* SELECTED CHIPS BAR */}
      {selectedAttributes.length > 0 && (
        <div className="shrink-0 border-b bg-muted/30 px-6 py-2.5 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              انتخاب‌شده‌های نهایی:
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-destructive hover:underline font-medium transition-colors"
            >
              حذف همه انتخاب‌ها
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-17.5 overflow-y-auto custom-scrollbar">
            {selectedAttributes.map(attribute => {
              const cat = getCategoryMeta(attribute.category);
              return (
                <div
                  key={attribute.id}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                    cat.border,
                    cat.bg,
                    cat.color
                  )}
                >
                  <span>{attribute.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleAttribute(attribute.id)}
                    className="rounded hover:bg-background/30 hover:text-destructive transition-colors p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GRID AREA */}
      <main className="flex-1 overflow-y-auto bg-muted/5 p-6 custom-scrollbar">
        {filteredAttributes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <Search className="size-8 text-muted-foreground/50" />
            </div>
            <p className="text-base font-semibold text-foreground">
              هیچ مشخصه‌ای در این بخش یافت نشد
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              لطفاً عبارت جستجو یا دسته‌بندی را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAttributes.map(attribute => {
              const selected = selectedSet.has(attribute.id);
              const cat = getCategoryMeta(attribute.category);
              const Icon = cat.icon;

              return (
                <button
                  key={attribute.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => toggleAttribute(attribute.id)}
                  className={cn(
                    'group relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-xl border p-4 text-right transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    selected
                      ? 'border-primary bg-primary/4 shadow-sm ring-1 ring-primary/25'
                      : 'border-border/60 bg-card hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5',
                    'border-r-4',
                    cat.border,
                    isSubmitting && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {/* ردیف بالا: آیکون دسته + چک‌باکس */}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn('inline-flex shrink-0 rounded-lg p-1.5', cat.bg, cat.color)}
                    >
                      <Icon className="size-3.5" />
                    </span>

                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background group-hover:border-primary/50'
                      )}
                    >
                      {selected && <Check className="size-3 stroke-3" />}
                    </span>
                  </div>

                  {/* عنوان با ارتفاع ثابت برای هم‌ترازی گرید */}
                  <p className="line-clamp-2 min-h-9.5 text-sm font-bold leading-snug">
                    {attribute.label}
                  </p>

                  {/* نوار پایینی: کلید + واحد + نوع */}
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2.5 text-[11px]">
                    <span
                      dir="ltr"
                      className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-muted-foreground"
                    >
                      {attribute.key}
                    </span>

                    {attribute.unit && (
                      <span className="rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {attribute.unit}
                      </span>
                    )}

                    <span
                      className={cn(
                        'mr-auto inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold border',
                        TYPE_STYLE[attribute.type] ?? 'bg-muted text-muted-foreground'
                      )}
                    >
                      {TYPE_LABEL[attribute.type] ?? attribute.type}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>,
    document.body
  );
}
