'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';

import { Check, ChevronsUpDown, ListFilter, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react';

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

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

import {
  useAddCategoryAttribute,
  useDeleteCategoryAttribute,
  useGetAdminAttributes,
  useGetCategoryAttributes,
  useUpdateCategoryAttribute,
} from '@/hooks/useCategoryAttributes';

interface Props {
  categorySlug: string;
}

const TYPE_LABEL: Record<string, string> = {
  TEXT: 'متنی',
  NUMBER: 'عددی',
  BOOLEAN: 'بله / خیر',
  ENUM: 'انتخابی',
};

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.error;

    if (typeof apiMessage === 'string') {
      return apiMessage;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'عملیات ذخیره‌سازی با خطا مواجه شد.';
}

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
        'inline-flex h-8 min-w-[92px] items-center justify-between gap-2 rounded-lg border px-2.5 transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        checked ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20 hover:bg-muted/40',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <span
        className={cn(
          'text-xs font-medium whitespace-nowrap',
          checked ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          'relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-background shadow-sm transition-all',
            checked ? 'right-0.5' : 'right-[18px]'
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

  const [selectedAttributeId, setSelectedAttributeId] = useState('');

  const [comboOpen, setComboOpen] = useState(false);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [pendingUpdateKey, setPendingUpdateKey] = useState<string | null>(null);

  const unusedAttributes = useMemo(() => {
    const usedIds = new Set(categoryAttributes.map(attribute => attribute.attributeId));

    return availableAttributes.filter(attribute => !usedIds.has(attribute.id));
  }, [availableAttributes, categoryAttributes]);

  const selectedAttribute = useMemo(
    () => unusedAttributes.find(attribute => attribute.id === selectedAttributeId),
    [unusedAttributes, selectedAttributeId]
  );

  const mutationError = addMutation.error ?? updateMutation.error ?? deleteMutation.error;

  async function handleAdd() {
    if (!selectedAttributeId) {
      return;
    }

    try {
      await addMutation.mutateAsync({
        categorySlug,
        attributeId: selectedAttributeId,
        isRequired: false,
        isFilterable: false,
      });

      setSelectedAttributeId('');
      setComboOpen(false);
    } catch {
      // Error is handled by mutation state.
    }
  }

  async function handleToggle(id: string, field: 'isRequired' | 'isFilterable', value: boolean) {
    const key = `${id}:${field}`;

    setPendingUpdateKey(key);

    try {
      await updateMutation.mutateAsync({
        categorySlug,
        id,
        data: {
          [field]: value,
        },
      });
    } catch {
      // Error is handled by mutation state.
    } finally {
      setPendingUpdateKey(null);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) {
      return;
    }

    const id = pendingDeleteId;

    try {
      await deleteMutation.mutateAsync({
        categorySlug,
        id,
      });

      setPendingDeleteId(null);
    } catch {
      // Keep dialog open so error can be seen.
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

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 px-5 py-4">
            <Skeleton className="h-5 w-40" />
          </CardHeader>

          <CardContent className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full space-y-4">
      {/* Errors */}

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

      {/* =====================================================
          Add Attribute
      ====================================================== */}

      <Card className="overflow-visible">
        <CardHeader className="border-b border-border/60 px-5 py-4">
          <div>
            <CardTitle className="text-sm font-semibold">افزودن مشخصه فنی</CardTitle>

            <p className="mt-1 text-xs text-muted-foreground">
              مشخصه‌ای را که می‌خواهید برای این دسته فعال شود انتخاب کنید.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboOpen}
                  disabled={isAttributesLoading}
                  className="h-10 min-w-0 flex-1 justify-between rounded-lg px-3 text-sm font-normal"
                >
                  <span className="truncate">
                    {selectedAttribute
                      ? `${selectedAttribute.label} — ${selectedAttribute.key}`
                      : 'جستجو و انتخاب مشخصه...'}
                  </span>

                  <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>

              <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="جستجوی مشخصه..." className="h-10" />

                  <CommandList>
                    <CommandEmpty className="py-6 text-xs">
                      {unusedAttributes.length === 0
                        ? 'همه مشخصه‌ها اضافه شده‌اند'
                        : 'موردی پیدا نشد'}
                    </CommandEmpty>

                    <CommandGroup className="p-1.5">
                      {unusedAttributes.map(attribute => (
                        <CommandItem
                          key={attribute.id}
                          value={`${attribute.label} ${attribute.key}`}
                          onSelect={() => {
                            setSelectedAttributeId(attribute.id);
                            setComboOpen(false);
                          }}
                          className="rounded-md"
                        >
                          <Check
                            className={cn(
                              'ml-2 size-4 shrink-0',
                              selectedAttributeId === attribute.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />

                          <span className="min-w-0 flex-1 truncate text-sm">{attribute.label}</span>

                          <span className="text-[11px] text-muted-foreground">{attribute.key}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              disabled={!selectedAttributeId || addMutation.isPending}
              onClick={() => void handleAdd()}
              className="h-10 rounded-lg px-5 sm:min-w-24"
            >
              {addMutation.isPending ? (
                <Loader2 className="ml-2 size-4 animate-spin" />
              ) : (
                <Plus className="ml-2 size-4" />
              )}

              {addMutation.isPending ? 'در حال افزودن...' : 'افزودن'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          Active Attributes
      ====================================================== */}

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/60 px-5 py-4">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">مشخصات فعال این دسته</CardTitle>

            <p className="mt-1 text-xs text-muted-foreground">
              وضعیت استفاده از هر مشخصه در فرم محصول و فیلترها را مدیریت کنید.
            </p>
          </div>

          <Badge variant="outline" className="shrink-0 rounded-full px-2.5 text-xs">
            {categoryAttributes.length} مورد
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {categoryAttributes.length === 0 ? (
            <div className="m-4 flex flex-col items-center justify-center rounded-xl border border-dashed px-5 py-12 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListFilter className="size-5" />
              </div>

              <p className="text-sm font-medium">هنوز مشخصه‌ای برای این دسته ثبت نشده است.</p>

              <p className="mt-1 text-xs text-muted-foreground">از بخش بالا یک مشخصه اضافه کنید.</p>
            </div>
          ) : (
            <div>
              {categoryAttributes.map(attribute => {
                const requiredPending = pendingUpdateKey === `${attribute.id}:isRequired`;

                const filterPending = pendingUpdateKey === `${attribute.id}:isFilterable`;

                return (
                  <div
                    key={attribute.id}
                    className={cn(
                      'flex flex-col gap-3',
                      'border-b border-border/60 px-5 py-4 last:border-b-0',
                      'transition-colors hover:bg-muted/[0.025]',
                      'md:flex-row md:items-center md:gap-5'
                    )}
                  >
                    {/* Attribute info */}

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-semibold">{attribute.label}</span>

                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px]"
                        >
                          {TYPE_LABEL[attribute.type] ?? attribute.type}
                        </Badge>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted-foreground">
                        <span dir="ltr">{attribute.key}</span>

                        {attribute.unit && (
                          <>
                            <span>•</span>
                            <span>{attribute.unit}</span>
                          </>
                        )}

                        {attribute.options?.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{attribute.options.length} گزینه</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Settings */}

                    <div className="flex shrink-0 items-center gap-2">
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
                        onChange={checked =>
                          void handleToggle(attribute.id, 'isFilterable', checked)
                        }
                      />
                    </div>

                    {/* Single delete button */}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="حذف از این دسته"
                      disabled={deleteMutation.isPending}
                      onClick={() => setPendingDeleteId(attribute.id)}
                      className="size-8 shrink-0 self-end rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive md:self-center"
                    >
                      {deleteMutation.isPending && pendingDeleteId === attribute.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          Delete confirmation
      ====================================================== */}

      <AlertDialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={open => {
          if (!open && !deleteMutation.isPending) {
            setPendingDeleteId(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف این مشخصه؟</AlertDialogTitle>

            <AlertDialogDescription className="leading-6">
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
