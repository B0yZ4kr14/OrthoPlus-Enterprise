// cspell:disable
import type { BMICategory, BPStatus } from "./types";

export function getBMICategory(bmi: number | null | undefined): BMICategory | null {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-info" };
  if (bmi < 25) return { label: "Peso normal", color: "text-success" };
  if (bmi < 30) return { label: "Sobrepeso", color: "text-warning" };
  return { label: "Obesidade", color: "text-destructive" };
}

export function getBPStatus(
  systolic: number | null | undefined,
  diastolic: number | null | undefined
): BPStatus | null {
  if (!systolic || !diastolic) return null;
  if (systolic < 120 && diastolic < 80) return { label: "Normal", color: "text-success" };
  if (systolic < 130 && diastolic < 85) return { label: "Elevada", color: "text-info" };
  if (systolic < 140 || diastolic < 90) return { label: "Hipertensão Estágio 1", color: "text-warning" };
  return { label: "Hipertensão Estágio 2", color: "text-destructive" };
}
