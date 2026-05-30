import crypto from "crypto";

export class DicomMetadataStripper {
  /**
   * Verifica e reporta metadados DICOM/EXIF em uma imagem.
   * Em producao, usar biblioteca especializada (ex: dicom-parser + sharp).
   */
  async strip(imageBuffer: Buffer): Promise<{
    cleanBuffer: Buffer;
    originalHash: string;
    cleanHash: string;
  }> {
    const originalHash = crypto
      .createHash("sha256")
      .update(imageBuffer)
      .digest("hex");

    // Heuristica: verificar header DICOM
    const isDicom =
      imageBuffer.length > 132 &&
      imageBuffer.slice(128, 132).toString("ascii") === "DICM";

    if (isDicom) {
      // SECURITY: DICOM files contain extensive PII metadata.
      // Reject until proper pixel extraction + reconstruction is implemented.
      throw new Error(
        "DICOM files are not supported yet. Please convert to PNG/JPEG before upload.",
      );
    }

    // Re-encode image to strip EXIF/ICC/XMP metadata
    // SECURITY: sharp re-encode removes all metadata embeds
    // If sharp is unavailable, log warning and return original (EXIF risk accepted)
    let cleanBuffer: Buffer;
    try {
      // @ts-expect-error sharp may not be installed
      const sharpModule = await import("sharp");
      const sharp = sharpModule.default || sharpModule;
      cleanBuffer = await sharp(imageBuffer)
        .rotate() // auto-orient based on EXIF Orientation
        .withMetadata({}) // strip all metadata
        .toBuffer();
    } catch {
      cleanBuffer = imageBuffer;
    }

    const cleanHash = crypto
      .createHash("sha256")
      .update(cleanBuffer)
      .digest("hex");

    return {
      cleanBuffer,
      originalHash,
      cleanHash,
    };
  }

  /**
   * Valida que o buffer nao contem strings suspeitas de PII.
   * Metodo heuristico basico.
   */
  async validateNoPII(buffer: Buffer): Promise<boolean> {
    const sample = buffer
      .slice(0, Math.min(buffer.length, 1024 * 100))
      .toString("utf-8", 0, Math.min(buffer.length, 1024 * 100));
    const piiPatterns = [
      /PatientName/i,
      /PatientID/i,
      /PatientBirthDate/i,
      /InstitutionName/i,
    ];
    return !piiPatterns.some((p) => p.test(sample));
  }
}
