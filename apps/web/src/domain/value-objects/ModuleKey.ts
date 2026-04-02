/**
 * ModuleKey Value Object
 * Garante que module keys sejam sempre válidas no domínio
 */
export class ModuleKey {
  private readonly value: string;

  private constructor(key: string) {
    this.value = key;
  }

  static create(key: string): ModuleKey {
    if (!key || typeof key !== "string") {
      throw new Error("Module key é obrigatória");
    }

    const trimmed = key.trim().toUpperCase();

    // Valida formato (apenas letras maiúsculas e underscores)
    if (!/^[A-Z_]+$/.test(trimmed)) {
      throw new Error(
        "Module key deve conter apenas letras maiúsculas e underscores",
      );
    }

    if (trimmed.length < 2 || trimmed.length > 50) {
      throw new Error("Module key deve ter entre 2 e 50 caracteres");
    }

    return new ModuleKey(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ModuleKey): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
