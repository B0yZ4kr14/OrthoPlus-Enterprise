"use client";

import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Camera } from "lucide-react";
import { useKruxIntegration } from "./useKruxIntegration";
import { KruxHeader } from "./KruxHeader";
import { WorkflowAlert } from "./WorkflowAlert";
import { StatusDisplay } from "./StatusDisplay";
import { ScanningView } from "./ScanningView";
import { SignedView } from "./SignedView";

export function KruxIntegration() {
  const { status, scanSignedTransaction, broadcastTransaction, reset } =
    useKruxIntegration();

  return (
    <Card>
      <KruxHeader />
      <CardContent className="space-y-4">
        <WorkflowAlert />
        <StatusDisplay status={status} />

        {status === "idle" && (
          <Button onClick={scanSignedTransaction} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Escanear Transação Assinada
          </Button>
        )}

        {status === "scanning" && <ScanningView />}

        {status === "signed" && (
          <SignedView onBroadcast={broadcastTransaction} onCancel={reset} />
        )}
      </CardContent>
    </Card>
  );
}
