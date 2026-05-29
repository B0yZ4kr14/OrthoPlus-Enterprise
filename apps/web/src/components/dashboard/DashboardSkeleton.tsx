import { Card, CardContent, CardHeader } from "@orthoplus/core-ui/card";

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-[hsl(var(--card))] dark:via-[hsl(var(--muted))] dark:to-[hsl(var(--card))] bg-[length:200%_100%] animate-shimmer rounded-lg ${className || ""}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div
      data-testid="loading"
      className="container mx-auto p-6 space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Carregando dashboard"
    >
      {/* Header Skeleton */}
      <div className="space-y-2">
        <ShimmerBlock className="h-8 w-64 rounded-xl" />
        <ShimmerBlock className="h-4 w-96 rounded-lg" />
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-muted/50 rounded-full p-1 inline-flex">
        {[1, 2, 3, 4].map((i) => (
          <ShimmerBlock key={i} className="h-8 w-24 rounded-full mx-0.5" />
        ))}
      </div>

      {/* Stats Cards Skeleton - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="elevated">
            <CardContent className="p-6">
              <div className="space-y-3">
                <ShimmerBlock className="h-12 w-12 rounded-full" />
                <ShimmerBlock className="h-8 w-24 rounded-lg" />
                <ShimmerBlock className="h-4 w-32 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton - 2 chart cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} variant="gradient">
            <CardHeader>
              <ShimmerBlock className="h-6 w-40 rounded-lg" />
              <ShimmerBlock className="h-4 w-56 rounded-md" />
            </CardHeader>
            <CardContent>
              <ShimmerBlock className="h-[300px] w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pie Chart Skeleton */}
      <Card variant="gradient">
        <CardHeader>
          <ShimmerBlock className="h-6 w-40 rounded-lg" />
          <ShimmerBlock className="h-4 w-56 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ShimmerBlock className="h-[300px] w-[300px] rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
