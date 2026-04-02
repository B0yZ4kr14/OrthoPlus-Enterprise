export type CategoryType = "RECEITA" | "DESPESA";

export interface CategoryProps {
  id: string;
  clinicId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  constructor(private props: CategoryProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.clinicId) {
      throw new Error("ID da clínica é obrigatório");
    }

    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error("Nome da categoria é obrigatório");
    }

    if (this.props.name.length > 100) {
      throw new Error("Nome da categoria não pode ter mais de 100 caracteres");
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get clinicId(): string {
    return this.props.clinicId;
  }
  get name(): string {
    return this.props.name;
  }
  get type(): CategoryType {
    return this.props.type;
  }
  get color(): string | undefined {
    return this.props.color;
  }
  get icon(): string | undefined {
    return this.props.icon;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain Methods
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Nome da categoria não pode ser vazio");
    }

    if (name.length > 100) {
      throw new Error("Nome da categoria não pode ter mais de 100 caracteres");
    }

    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  updateAppearance(color?: string, icon?: string): void {
    if (color) this.props.color = color;
    if (icon) this.props.icon = icon;
    this.props.updatedAt = new Date();
  }

  toJSON(): CategoryProps {
    return { ...this.props };
  }
}
