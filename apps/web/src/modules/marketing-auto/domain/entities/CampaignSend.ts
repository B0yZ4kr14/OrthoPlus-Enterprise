export type CampaignSendStatus =
  | "AGENDADO"
  | "ENVIADO"
  | "ENTREGUE"
  | "ABERTO"
  | "CLICADO"
  | "CONVERTIDO"
  | "ERRO";

export interface CampaignSendProps {
  id: string;
  campaignId: string;
  patientId: string;
  recipientName: string;
  recipientContact: string; // Email ou telefone
  messageContent?: string; // Mensagem renderizada
  status: CampaignSendStatus;
  scheduledFor: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  convertedAt?: Date;
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export class CampaignSend {
  constructor(private props: CampaignSendProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.campaignId) {
      throw new Error("ID da campanha é obrigatório");
    }

    if (!this.props.patientId) {
      throw new Error("ID do paciente é obrigatório");
    }

    if (
      !this.props.recipientName ||
      this.props.recipientName.trim().length === 0
    ) {
      throw new Error("Nome do destinatário é obrigatório");
    }

    if (
      !this.props.recipientContact ||
      this.props.recipientContact.trim().length === 0
    ) {
      throw new Error("Contato do destinatário é obrigatório");
    }

    if (this.props.retryCount < 0) {
      throw new Error("Número de tentativas não pode ser negativo");
    }

    if (this.props.retryCount > 5) {
      throw new Error("Número máximo de tentativas excedido");
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get campaignId(): string {
    return this.props.campaignId;
  }
  get patientId(): string {
    return this.props.patientId;
  }
  get recipientName(): string {
    return this.props.recipientName;
  }
  get recipientContact(): string {
    return this.props.recipientContact;
  }
  get messageContent(): string | undefined {
    return this.props.messageContent;
  }
  get status(): CampaignSendStatus {
    return this.props.status;
  }
  get scheduledFor(): Date {
    return this.props.scheduledFor;
  }
  get sentAt(): Date | undefined {
    return this.props.sentAt;
  }
  get deliveredAt(): Date | undefined {
    return this.props.deliveredAt;
  }
  get openedAt(): Date | undefined {
    return this.props.openedAt;
  }
  get clickedAt(): Date | undefined {
    return this.props.clickedAt;
  }
  get convertedAt(): Date | undefined {
    return this.props.convertedAt;
  }
  get errorMessage(): string | undefined {
    return this.props.errorMessage;
  }
  get errorCode(): string | undefined {
    return this.props.errorCode;
  }
  get retryCount(): number {
    return this.props.retryCount;
  }
  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Domain Methods

  isScheduled(): boolean {
    return this.props.status === "AGENDADO";
  }

  isSent(): boolean {
    return ["ENVIADO", "ENTREGUE", "ABERTO", "CLICADO", "CONVERTIDO"].includes(
      this.props.status,
    );
  }

  isDelivered(): boolean {
    return ["ENTREGUE", "ABERTO", "CLICADO", "CONVERTIDO"].includes(
      this.props.status,
    );
  }

  isOpened(): boolean {
    return ["ABERTO", "CLICADO", "CONVERTIDO"].includes(this.props.status);
  }

  isClicked(): boolean {
    return ["CLICADO", "CONVERTIDO"].includes(this.props.status);
  }

  isConverted(): boolean {
    return this.props.status === "CONVERTIDO";
  }

  hasError(): boolean {
    return this.props.status === "ERRO";
  }

  canRetry(): boolean {
    return this.hasError() && this.props.retryCount < 5;
  }

  markAsSent(): void {
    if (!this.isScheduled()) {
      throw new Error(
        "Envio só pode ser marcado como enviado se estiver agendado",
      );
    }

    this.props.status = "ENVIADO";
    this.props.sentAt = new Date();
  }

  markAsDelivered(): void {
    if (!this.isSent()) {
      throw new Error("Envio só pode ser marcado como entregue se foi enviado");
    }

    this.props.status = "ENTREGUE";
    this.props.deliveredAt = new Date();
  }

  markAsOpened(): void {
    if (!this.isDelivered()) {
      throw new Error("Envio só pode ser marcado como aberto se foi entregue");
    }

    this.props.status = "ABERTO";
    this.props.openedAt = new Date();
  }

  markAsClicked(): void {
    if (!this.isOpened()) {
      throw new Error("Envio só pode ser marcado como clicado se foi aberto");
    }

    this.props.status = "CLICADO";
    this.props.clickedAt = new Date();
  }

  markAsConverted(): void {
    if (!this.isClicked() && !this.isOpened()) {
      throw new Error(
        "Envio só pode ser marcado como convertido se foi aberto ou clicado",
      );
    }

    this.props.status = "CONVERTIDO";
    this.props.convertedAt = new Date();
  }

  markAsError(errorMessage: string, errorCode?: string): void {
    this.props.status = "ERRO";
    this.props.errorMessage = errorMessage;
    this.props.errorCode = errorCode;
  }

  incrementRetryCount(): void {
    if (!this.canRetry()) {
      throw new Error("Número máximo de tentativas atingido");
    }

    this.props.retryCount += 1;
  }

  reschedule(newDate: Date): void {
    if (!this.hasError() && !this.isScheduled()) {
      throw new Error(
        "Apenas envios com erro ou agendados podem ser reagendados",
      );
    }

    if (newDate < new Date()) {
      throw new Error("Data de reagendamento não pode ser no passado");
    }

    this.props.scheduledFor = newDate;
    this.props.status = "AGENDADO";
    this.props.errorMessage = undefined;
    this.props.errorCode = undefined;
  }

  setMessageContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error("Conteúdo da mensagem não pode ser vazio");
    }

    this.props.messageContent = content;
  }

  addMetadata(key: string, value: unknown): void {
    if (!this.props.metadata) {
      this.props.metadata = {};
    }

    this.props.metadata[key] = value;
  }

  getDeliveryTime(): number | null {
    if (!this.props.sentAt || !this.props.deliveredAt) {
      return null;
    }

    return this.props.deliveredAt.getTime() - this.props.sentAt.getTime();
  }

  getOpenTime(): number | null {
    if (!this.props.deliveredAt || !this.props.openedAt) {
      return null;
    }

    return this.props.openedAt.getTime() - this.props.deliveredAt.getTime();
  }

  toJSON(): CampaignSendProps {
    return { ...this.props };
  }
}
