/**
 * usePatients Hooks
 * Gerencia operações de pacientes através da REST API
 */

import { usePatientsClean } from "./usePatientsClean";
import type { UsePatientsReturn } from "./types";

export type { UsePatientsReturn } from "./types";

export function usePatientsUnified(): UsePatientsReturn {
  return usePatientsClean();
}

export { usePatientsUnified as usePatients };
