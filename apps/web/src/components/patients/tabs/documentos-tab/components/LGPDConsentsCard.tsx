import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { ConsentCard } from "./ConsentCard";
import { LGPD_CONSENTS } from "../constants/consents";

interface LGPDConsentsCardProps {
  patient: Record<string, any>;
}

export function LGPDConsentsCard({ patient }: LGPDConsentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Consentimentos e Termos (LGPD)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {LGPD_CONSENTS.map((consent) => (
            <ConsentCard
              key={consent.key}
              title={consent.title}
              description={consent.description}
              consented={!!patient[consent.consentKey]}
              date={consent.dateKey ? patient[consent.dateKey] : undefined}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
