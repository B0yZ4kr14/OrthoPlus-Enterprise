import type { DocumentosTabProps } from "./types";
import { LGPDConsentsCard } from "./components/LGPDConsentsCard";
import { DocumentsPlaceholder } from "./components/DocumentsPlaceholder";

export * from "./types";
export { LGPDConsentsCard, DocumentsPlaceholder };
export { ConsentCard } from "./components/ConsentCard";
export { LGPD_CONSENTS } from "./constants/consents";

export function DocumentosTab({ patient }: DocumentosTabProps) {
  return (
    <div className="space-y-6">
      <LGPDConsentsCard patient={patient} />
      <DocumentsPlaceholder />
    </div>
  );
}
