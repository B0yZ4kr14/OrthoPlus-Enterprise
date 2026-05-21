import crypto from "crypto"

export class DicomMetadataStripper {
  /**
   * Verifica e reporta metadados DICOM/EXIF em uma imagem.
   * Em producao, usar biblioteca especializada (ex: dicom-parser + sharp).
   */
  async strip(imageBuffer: Buffer): Promise<{
    cleanBuffer: Buffer
    originalHash: string
    cleanHash: string
  }> {
    const originalHash = crypto.createHash("sha256").update(imageBuffer).digest("hex")

    // Heuristica: verificar header DICOM
    const isDicom = imageBuffer.length > 132 &&
      imageBuffer.slice(128, 132).toString("ascii") === "DICM"

    if (isDicom) {
      // TODO: em producao, extrair pixels do DICOM e reconstruir PNG
      // Simplificacao: retorna buffer original marcado como DICOM
      console.warn("[DicomMetadataStripper] DICOM detectado. Em producao, extrair pixels e reconstruir PNG.")
    }

    // TODO: em producao, usar sharp para re-encode JPEG/PNG e remover EXIF/ICC/XMP
    // Simplificacao: retorna buffer original (seguranca reduzida em dev)
    const cleanHash = crypto.createHash("sha256").update(imageBuffer).digest("hex")

    return {
      cleanBuffer: imageBuffer,
      originalHash,
      cleanHash,
    }
  }

  /**
   * Valida que o buffer nao contem strings suspeitas de PII.
   * Metodo heuristico basico.
   */
  async validateNoPII(buffer: Buffer): Promise<boolean> {
    const sample = buffer.slice(0, Math.min(buffer.length, 1024 * 100)).toString("utf-8", 0, Math.min(buffer.length, 1024 * 100))
    const piiPatterns = [
      /PatientName/i,
      /PatientID/i,
      /PatientBirthDate/i,
      /InstitutionName/i,
    ]
    return !piiPatterns.some((p) => p.test(sample))
  }
}
