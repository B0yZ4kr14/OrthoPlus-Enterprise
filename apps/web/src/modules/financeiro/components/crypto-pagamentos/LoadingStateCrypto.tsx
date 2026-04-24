// cspell:disable
import { Bitcoin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader } from "@orthoplus/core-ui/card";
import { Skeleton } from "@orthoplus/core-ui/skeleton";
import { CryptoKPISkeleton, CryptoListSkeleton } from "@/components/crypto/CryptoSkeleton";

export function LoadingStateCrypto() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        icon={Bitcoin}
        title="Pagamentos em Criptomoedas"
        description="Receba pagamentos em Bitcoin e outras criptomoedas"
      />

      <CryptoKPISkeleton />

      <Card depth="normal" className="mt-6">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <CryptoListSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
