/**
 * usePatients Hooks
 * Gerencia operações de pacientes através da REST API
 */

import { usePatientsAPI } from "./usePatientsAPI";
import type { UsePatientsReturn } from "./types";

export type { UsePatientsReturn } from "./types";

export function usePatientsUnified(): UsePatientsReturn {
  return usePatientsAPI();
}

export { usePatientsUnified as usePatients };
