import { ModuleKey } from "../value-objects/ModuleKey";

export interface ModuleProps {
  id: number;
  moduleKey: ModuleKey;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  subscribedAt: Date;
}

/**
 * Module Entity
 * Representa um módulo contratado pela clínica
 */
export class Module {
  private props: ModuleProps;

  private constructor(props: ModuleProps) {
    this.props = props;
  }

  static create(props: Omit<ModuleProps, "subscribedAt">): Module {
    // Validações de domínio
    if (!props.name || props.name.trim().length < 3) {
      throw new Error("Nome do módulo deve ter pelo menos 3 caracteres");
    }

    if (!props.category || props.category.trim().length === 0) {
      throw new Error("Categoria é obrigatória");
    }

    return new Module({
      ...props,
      subscribedAt: new Date(),
    });
  }

  static restore(props: ModuleProps): Module {
    return new Module(props);
  }

  // Getters
  get id(): number {
    return this.props.id;
  }

  get moduleKey(): ModuleKey {
    return this.props.moduleKey;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get subscribedAt(): Date {
    return this.props.subscribedAt;
  }

  // Domain methods
  activate(): void {
    if (this.props.isActive) {
      throw new Error("Módulo já está ativo");
    }
    this.props.isActive = true;
  }

  deactivate(): void {
    if (!this.props.isActive) {
      throw new Error("Módulo já está inativo");
    }
    this.props.isActive = false;
  }

  // Conversão para primitivos
  toObject(): ModuleProps {
    return { ...this.props };
  }
}
