// cspell:disable
import { Skeleton } from "@orthoplus/core-ui/skeleton";

export function LoadingState() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
