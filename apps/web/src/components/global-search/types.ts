import type { Patient, Appointment, Procedure } from "@orthoplus/shared-types";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "patient" | "appointment" | "procedure" | "transaction" | "product";
  route: string;
  icon: React.ElementType;
}

export type { Patient, Appointment, Procedure };
