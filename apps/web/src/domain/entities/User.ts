import { Email } from "../value-objects/Email";

export type AppRole = "ADMIN" | "MEMBER";

export interface UserProps {
  id: string;
  clinicId: string;
  email: Email;
  fullName: string;
  appRole: AppRole;
  isActive: boolean;
  avatarUrl?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Entity (Aggregate Root)
 * Representa um usuário do sistema
 */
export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(
    props: Omit<UserProps, "id" | "createdAt" | "updatedAt">,
  ): User {
    // Validações de domínio
    if (!props.fullName || props.fullName.trim().length < 3) {
      throw new Error("Nome completo deve ter pelo menos 3 caracteres");
    }

    if (!props.clinicId) {
      throw new Error("Clínica é obrigatória");
    }

    if (!["ADMIN", "MEMBER"].includes(props.appRole)) {
      throw new Error("Role inválida");
    }

    const now = new Date();

    return new User({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: UserProps): User {
    return new User(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get email(): Email {
    return this.props.email;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get appRole(): AppRole {
    return this.props.appRole;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  isAdmin(): boolean {
    return this.props.appRole === "ADMIN";
  }

  isMember(): boolean {
    return this.props.appRole === "MEMBER";
  }

  promoteToAdmin(): void {
    if (this.isAdmin()) {
      throw new Error("Usuário já é administrador");
    }
    this.props.appRole = "ADMIN";
    this.props.updatedAt = new Date();
  }

  demoteToMember(): void {
    if (this.isMember()) {
      throw new Error("Usuário já é membro");
    }
    this.props.appRole = "MEMBER";
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.isActive) {
      throw new Error("Usuário já está ativo");
    }
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    if (!this.props.isActive) {
      throw new Error("Usuário já está inativo");
    }
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateFullName(newName: string): void {
    if (!newName || newName.trim().length < 3) {
      throw new Error("Nome completo deve ter pelo menos 3 caracteres");
    }
    this.props.fullName = newName.trim();
    this.props.updatedAt = new Date();
  }

  updatePhone(newPhone: string): void {
    this.props.phone = newPhone;
    this.props.updatedAt = new Date();
  }

  updateAvatarUrl(newUrl: string): void {
    this.props.avatarUrl = newUrl;
    this.props.updatedAt = new Date();
  }

  // Conversão para primitivos
  toObject(): UserProps {
    return { ...this.props };
  }
}
