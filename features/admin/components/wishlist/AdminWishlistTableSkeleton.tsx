// components/admin/AdminWishlistTableSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AdminWishlistTableSkeleton() {
  return (
    <Card dir="rtl">
      <CardHeader className="border-b">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
