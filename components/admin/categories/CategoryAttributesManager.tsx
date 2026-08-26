// CategoryAttributesManager.tsx
'use client';

import { useMemo, useState } from 'react';

import axios from 'axios';

import { ListFilter, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

import {
  useAddCategoryAttribute,
  useDeleteCategoryAttribute,
  useGetAdminAttributes,
  useGetCategoryAttributes,
  useUpdateCategoryAttribute,
} from '@/hooks/useCategoryAttributes';

import { AttributeSelectorDialog } from './AttributeSelectorDialog';

interface Props {
  categorySlug: string;
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

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.error;
    if (typeof apiMessage === 'string') return apiMessage;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'عملیات ذخیره‌سازی با خطا مواجه شد.';
}

/* =========================================================
   Compact Toggle
========================================================= */

interface CompactToggleProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function CompactToggle({ label, checked, disabled = false, onChange }: CompactToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${label}: ${checked ? 'فعال' : 'غیرفعال'}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-8 flex-1 items-center justify-between gap-1.5 rounded-lg border px-2.5 transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        checked ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20 hover:bg-muted/40',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <span
        className={cn(
          'whitespace-nowrap text-[11px] font-medium',
          checked ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          'relative flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-background shadow-sm transition-all',
            checked ? 'right-0.5' : 'right-4'
          )}
        />
      </span>
    </button>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      dir="rtl"
      className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5"
    >
      <span className="text-xs text-destructive">{message}</span>

      {onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" />
          تلاش مجدد
        </Button>
      )}
    </div>
  );
}

/* =========================================================
   Main Component
========================================================= */

export function CategoryAttributesManager({ categorySlug }: Props) {
  const {
    data: categoryAttributes = [],
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    refetch: refetchCategoryAttributes,
  } = useGetCategoryAttributes(categorySlug);

  const {
    data: availableAttributes = [],
    isLoading: isAttributesLoading,
    isError: isAttributesError,
    refetch: refetchAvailableAttributes,
  } = useGetAdminAttributes();

  const addMutation = useAddCategoryAttribute();
  const updateMutation = useUpdateCategoryAttribute();
  const deleteMutation = useDeleteCategoryAttribute();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingUpdateKey, setPendingUpdateKey] = useState<string | null>(null);

  const unusedAttributes = useMemo(() => {
    const usedIds = new Set(categoryAttributes.map(attribute => attribute.attributeId));
    return availableAttributes.filter(attribute => !usedIds.has(attribute.id));
  }, [availableAttributes, categoryAttributes]);

  const mutationError = addMutation.error ?? updateMutation.error ?? deleteMutation.error;

  async function handleAddAttributes(attributeIds: string[]) {
    if (attributeIds.length === 0) return;

    try {
      for (const attributeId of attributeIds) {
        await addMutation.mutateAsync({
          categorySlug,
          attributeId,
          isRequired: false,
          isFilterable: false,
        });
      }
      setAddDialogOpen(false);
    } catch {
      // خطا از طریق ErrorBanner نمایش داده می‌شود؛ دیالوگ باز می‌ماند
    }
  }

  async function handleToggle(id: string, field: 'isRequired' | 'isFilterable', value: boolean) {
    const key = `${id}:${field}`;
    setPendingUpdateKey(key);

    try {
      await updateMutation.mutateAsync({
        categorySlug,
        id,
        data: { [field]: value },
      });
    } catch {
      // خطا از طریق mutationError نمایش داده می‌شود
    } finally {
      setPendingUpdateKey(null);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;

    try {
      await deleteMutation.mutateAsync({ categorySlug, id });
      setPendingDeleteId(null);
    } catch {
      // دیالوگ باز می‌ماند تا خطا دیده شود
    }
  }

  if (isCategoryLoading) {
    return (
      <div dir="rtl" className="w-full space-y-4">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 px-5 py-4">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full space-y-4">
      {isCategoryError && (
        <ErrorBanner
          message="دریافت مشخصات این دسته‌بندی با خطا مواجه شد."
          onRetry={() => void refetchCategoryAttributes()}
        />
      )}

      {isAttributesError && (
        <ErrorBanner
          message="دریافت لیست مشخصات قابل استفاده با خطا مواجه شد."
          onRetry={() => void refetchAvailableAttributes()}
        />
      )}

      {mutationError && <ErrorBanner message={getApiErrorMessage(mutationError)} />}

      {/* افزودن مشخصه */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 px-5 py-4">
          <CardTitle className="text-sm font-semibold">افزودن مشخصه فنی</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            یک یا چند مشخصه را برای این دسته‌بندی فعال کنید.
          </p>
        </CardHeader>

        <CardContent className="p-4">
          <Button
            type="button"
            disabled={isAttributesLoading || unusedAttributes.length === 0}
            onClick={() => setAddDialogOpen(true)}
            className="h-10 w-full rounded-lg sm:w-auto sm:min-w-40"
          >
            {isAttributesLoading ? (
              <>
                <Loader2 className="ml-2 size-4 animate-spin" />
                در حال دریافت...
              </>
            ) : (
              <>
                <Plus className="ml-2 size-4" />
                {unusedAttributes.length === 0 ? 'همه مشخصه‌ها اضافه شده‌اند' : 'افزودن مشخصه'}
              </>
            )}
          </Button>

          <AttributeSelectorDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            attributes={unusedAttributes}
            isSubmitting={addMutation.isPending}
            onSubmit={handleAddAttributes}
          />
        </CardContent>
      </Card>

      {/* مشخصات فعال — گرید چهارتایی باکس‌مانند */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold">مشخصات فعال این دسته</h2>
          <Badge variant="outline" className="shrink-0 rounded-full px-2.5 text-xs">
            {categoryAttributes.length} مورد
          </Badge>
        </div>

        {categoryAttributes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-5 py-12 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ListFilter className="size-5" />
            </div>
            <p className="text-sm font-medium">هنوز مشخصه‌ای برای این دسته ثبت نشده است.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              از بخش بالا یک یا چند مشخصه اضافه کنید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryAttributes.map(attribute => {
              const requiredPending = pendingUpdateKey === `${attribute.id}:isRequired`;
              const filterPending = pendingUpdateKey === `${attribute.id}:isFilterable`;
              const isDeleting = deleteMutation.isPending && pendingDeleteId === attribute.id;

              return (
                <div
                  key={attribute.id}
                  className="group relative flex h-full flex-col justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
                >
                  {/* دکمه حذف - گوشه */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="حذف از این دسته"
                    disabled={deleteMutation.isPending}
                    onClick={() => setPendingDeleteId(attribute.id)}
                    className="absolute left-2 top-2 size-7 shrink-0 rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>

                  {/* عنوان و نوع */}
                  <div className="pl-7">
                    <p className="line-clamp-2 min-h-9.5 text-sm font-bold leading-snug">
                      {attribute.label}
                    </p>

                    <span
                      className={cn(
                        'mt-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border',
                        TYPE_STYLE[attribute.type] ?? 'bg-muted text-muted-foreground'
                      )}
                    >
                      {TYPE_LABEL[attribute.type] ?? attribute.type}
                    </span>
                  </div>

                  {/* متادیتا */}
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
                    <span dir="ltr" className="rounded bg-muted/60 px-1.5 py-0.5 font-mono">
                      {attribute.key}
                    </span>

                    {attribute.unit && (
                      <span className="rounded border px-1.5 py-0.5">{attribute.unit}</span>
                    )}

                    {attribute.options?.length > 0 && (
                      <span className="rounded border px-1.5 py-0.5">
                        {attribute.options.length} گزینه
                      </span>
                    )}
                  </div>

                  {/* کنترل‌ها */}
                  <div className="flex flex-col gap-1.5 border-t border-border/50 pt-2.5">
                    <CompactToggle
                      label="اجباری"
                      checked={attribute.isRequired}
                      disabled={requiredPending}
                      onChange={checked => void handleToggle(attribute.id, 'isRequired', checked)}
                    />

                    <CompactToggle
                      label="فیلتر"
                      checked={attribute.isFilterable}
                      disabled={filterPending}
                      onChange={checked => void handleToggle(attribute.id, 'isFilterable', checked)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* تأیید حذف */}
      <AlertDialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={open => {
          if (!open && !deleteMutation.isPending) {
            setPendingDeleteId(null);
          }
        }}
      >
        <AlertDialogContent dir="rtl" className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">حذف این مشخصه؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right leading-6">
              این مشخصه فقط از این دسته‌بندی حذف می‌شود و در سایر دسته‌بندی‌ها باقی خواهد ماند.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={event => {
                event.preventDefault();
                void handleConfirmDelete();
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 size-4 animate-spin" />
                  در حال حذف...
                </>
              ) : (
                'حذف کن'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
