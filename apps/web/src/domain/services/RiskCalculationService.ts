/**
 * Risk Calculation Service
 * Serviço de domínio para calcular scores de risco de pacientes
 */

export interface MedicalConditions {
  hasCardiovascularDisease: boolean;
  hasDiabetes: boolean;
  diabetesControlled?: boolean;
  hasHypertension: boolean;
  hypertensionControlled?: boolean;
  hasHIV: boolean;
  hasHepatitis: boolean;
  hasBleedingDisorder: boolean;
  hasMedicationAllergy: boolean;
  currentMedications?: string[];
}

export interface RiskScores {
  medical: number;
  surgical: number;
  anesthetic: number;
  overall: number;
}

export class RiskCalculationService {
  /**
   * Calcula todos os risk scores de um paciente
   */
  calculateRiskScores(conditions: MedicalConditions): RiskScores {
    const medical = this.calculateMedicalScore(conditions);
    const surgical = this.calculateSurgicalScore(conditions, medical);
    const anesthetic = this.calculateAnestheticScore(conditions, medical);

    // Overall score é a média ponderada
    const overall = Math.round(
      medical * 0.4 + surgical * 0.3 + anesthetic * 0.3,
    );

    return {
      medical: Math.min(medical, 100),
      surgical: Math.min(surgical, 100),
      anesthetic: Math.min(anesthetic, 100),
      overall: Math.min(overall, 100),
    };
  }

  /**
   * Calcula o score médico (0-100)
   */
  private calculateMedicalScore(conditions: MedicalConditions): number {
    let score = 0;

    // Doenças cardiovasculares: +25
    if (conditions.hasCardiovascularDisease) {
      score += 25;
    }

    // Diabetes não controlada: +20
    if (conditions.hasDiabetes && !conditions.diabetesControlled) {
      score += 20;
    }

    // Hipertensão não controlada: +15
    if (conditions.hasHypertension && !conditions.hypertensionControlled) {
      score += 15;
    }

    // HIV/AIDS: +15
    if (conditions.hasHIV) {
      score += 15;
    }

    // Hepatite: +10
    if (conditions.hasHepatitis) {
      score += 10;
    }

    // Distúrbios de coagulação: +15
    if (conditions.hasBleedingDisorder) {
      score += 15;
    }

    return score;
  }

  /**
   * Calcula o score cirúrgico (0-100)
   */
  private calculateSurgicalScore(
    conditions: MedicalConditions,
    medicalScore: number,
  ): number {
    let score = medicalScore; // Base no risco médico

    // Anticoagulantes: +20
    if (this.isOnAnticoagulants(conditions.currentMedications)) {
      score += 20;
    }

    // Distúrbios de coagulação: +25 adicional
    if (conditions.hasBleedingDisorder) {
      score += 25;
    }

    return score;
  }

  /**
   * Calcula o score anestésico (0-100)
   */
  private calculateAnestheticScore(
    conditions: MedicalConditions,
    medicalScore: number,
  ): number {
    let score = medicalScore; // Base no risco médico

    // Alergias a medicamentos: +20
    if (conditions.hasMedicationAllergy) {
      score += 20;
    }

    // Doenças cardiovasculares: +15 adicional
    if (conditions.hasCardiovascularDisease) {
      score += 15;
    }

    return score;
  }

  /**
   * Verifica se paciente está em uso de anticoagulantes
   */
  private isOnAnticoagulants(medications?: string[]): boolean {
    if (!medications) return false;

    const anticoagulants = [
      "varfarina",
      "warfarina",
      "heparina",
      "clopidogrel",
      "aspirina",
      "rivaroxabana",
      "apixabana",
      "dabigatrana",
    ];

    const medicationsLower = medications.map((m) => m.toLowerCase());

    return anticoagulants.some((anticoagulant) =>
      medicationsLower.some((med) => med.includes(anticoagulant)),
    );
  }

  /**
   * Determina o nível de risco baseado no overall score
   */
  determineRiskLevel(
    overallScore: number,
  ): "baixo" | "moderado" | "alto" | "critico" {
    if (overallScore >= 75) return "critico";
    if (overallScore >= 50) return "alto";
    if (overallScore >= 25) return "moderado";
    return "baixo";
  }
}
