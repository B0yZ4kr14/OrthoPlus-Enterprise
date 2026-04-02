/**
 * Entidade de Orçamento (Aggregate Root)
 * Representa um orçamento de tratamento odontológico
 */

export interface OrcamentoProps {
  id: string;
  clinicId: string;
  patientId: string;
  numeroOrcamento: string;
  titulo: string;
  descricao?: string;
  status: "RASCUNHO" | "PENDENTE" | "APROVADO" | "REJEITADO" | "EXPIRADO";
  tipoPagamento: "AVISTA" | "PARCELADO" | "CONVENIO";
  valorSubtotal: number;
  descontoPercentual: number;
  descontoValor: number;
  valorTotal: number;
  validadeDias: number;
  dataExpiracao: Date;
  aprovadoEm?: Date;
  aprovadoPor?: string;
  rejeitadoEm?: Date;
  rejeitadoPor?: string;
  motivoRejeicao?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class Orcamento {
  private constructor(private props: OrcamentoProps) {}

  /**
   * Factory method para criar novo orçamento
   */
  static create(
    props: Omit<
      OrcamentoProps,
      | "id"
      | "numeroOrcamento"
      | "createdAt"
      | "updatedAt"
      | "status"
      | "dataExpiracao"
    >,
  ): Orcamento {
    // Validações de domínio
    if (!props.clinicId?.trim()) {
      throw new Error("ID da clínica é obrigatório");
    }

    if (!props.patientId?.trim()) {
      throw new Error("ID do paciente é obrigatório");
    }

    if (!props.titulo?.trim()) {
      throw new Error("Título do orçamento é obrigatório");
    }

    if (!props.createdBy?.trim()) {
      throw new Error("ID do criador é obrigatório");
    }

    if (props.valorTotal < 0) {
      throw new Error("Valor total não pode ser negativo");
    }

    if (props.descontoPercentual < 0 || props.descontoPercentual > 100) {
      throw new Error("Desconto percentual deve estar entre 0 e 100");
    }

    if (props.validadeDias <= 0) {
      throw new Error("Validade deve ser maior que zero");
    }

    const now = new Date();
    const dataExpiracao = new Date(now);
    dataExpiracao.setDate(dataExpiracao.getDate() + props.validadeDias);

    // Gerar número único para o orçamento
    const numeroOrcamento = `ORC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;

    return new Orcamento({
      ...props,
      id: crypto.randomUUID(),
      numeroOrcamento,
      status: "RASCUNHO",
      dataExpiracao,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method para restaurar orçamento do banco
   */
  static restore(props: OrcamentoProps): Orcamento {
    return new Orcamento(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get numeroOrcamento(): string {
    return this.props.numeroOrcamento;
  }

  get titulo(): string {
    return this.props.titulo;
  }

  get descricao(): string | undefined {
    return this.props.descricao;
  }

  get status(): OrcamentoProps["status"] {
    return this.props.status;
  }

  get tipoPagamento(): OrcamentoProps["tipoPagamento"] {
    return this.props.tipoPagamento;
  }

  get valorSubtotal(): number {
    return this.props.valorSubtotal;
  }

  get descontoPercentual(): number {
    return this.props.descontoPercentual;
  }

  get descontoValor(): number {
    return this.props.descontoValor;
  }

  get valorTotal(): number {
    return this.props.valorTotal;
  }

  get validadeDias(): number {
    return this.props.validadeDias;
  }

  get dataExpiracao(): Date {
    return this.props.dataExpiracao;
  }

  get aprovadoEm(): Date | undefined {
    return this.props.aprovadoEm;
  }

  get aprovadoPor(): string | undefined {
    return this.props.aprovadoPor;
  }

  get rejeitadoEm(): Date | undefined {
    return this.props.rejeitadoEm;
  }

  get rejeitadoPor(): string | undefined {
    return this.props.rejeitadoPor;
  }

  get motivoRejeicao(): string | undefined {
    return this.props.motivoRejeicao;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  // Domain Methods

  /**
   * Verifica se pode ser enviado para aprovação
   */
  podeSerEnviado(): boolean {
    return this.props.status === "RASCUNHO" && !this.isExpirado();
  }

  /**
   * Envia orçamento para aprovação
   */
  enviarParaAprovacao(): void {
    if (!this.podeSerEnviado()) {
      throw new Error(
        "Apenas orçamentos em RASCUNHO e não expirados podem ser enviados",
      );
    }

    this.props.status = "PENDENTE";
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se pode ser aprovado
   */
  podeSerAprovado(): boolean {
    return this.props.status === "PENDENTE" && !this.isExpirado();
  }

  /**
   * Aprova o orçamento
   */
  aprovar(aprovadoPor: string): void {
    if (!this.podeSerAprovado()) {
      throw new Error(
        "Apenas orçamentos PENDENTES e não expirados podem ser aprovados",
      );
    }

    if (!aprovadoPor?.trim()) {
      throw new Error("ID do aprovador é obrigatório");
    }

    this.props.status = "APROVADO";
    this.props.aprovadoEm = new Date();
    this.props.aprovadoPor = aprovadoPor;
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se pode ser rejeitado
   */
  podeSerRejeitado(): boolean {
    return this.props.status === "PENDENTE";
  }

  /**
   * Rejeita o orçamento
   */
  rejeitar(rejeitadoPor: string, motivo: string): void {
    if (!this.podeSerRejeitado()) {
      throw new Error("Apenas orçamentos PENDENTES podem ser rejeitados");
    }

    if (!rejeitadoPor?.trim()) {
      throw new Error("ID do rejeitador é obrigatório");
    }

    if (!motivo?.trim()) {
      throw new Error("Motivo da rejeição é obrigatório");
    }

    this.props.status = "REJEITADO";
    this.props.rejeitadoEm = new Date();
    this.props.rejeitadoPor = rejeitadoPor;
    this.props.motivoRejeicao = motivo;
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se está expirado
   */
  isExpirado(): boolean {
    return this.props.dataExpiracao < new Date();
  }

  /**
   * Marca como expirado
   */
  marcarExpirado(): void {
    if (this.props.status !== "PENDENTE") {
      throw new Error(
        "Apenas orçamentos PENDENTES podem ser marcados como expirados",
      );
    }

    this.props.status = "EXPIRADO";
    this.props.updatedAt = new Date();
  }

  /**
   * Verifica se pode ser editado
   */
  podeSerEditado(): boolean {
    return this.props.status === "RASCUNHO";
  }

  /**
   * Atualiza valores do orçamento
   */
  atualizarValores(
    valorSubtotal: number,
    descontoPercentual: number,
    descontoValor: number,
  ): void {
    if (!this.podeSerEditado()) {
      throw new Error("Apenas orçamentos em RASCUNHO podem ser editados");
    }

    if (valorSubtotal < 0) {
      throw new Error("Valor subtotal não pode ser negativo");
    }

    if (descontoPercentual < 0 || descontoPercentual > 100) {
      throw new Error("Desconto percentual deve estar entre 0 e 100");
    }

    if (descontoValor < 0) {
      throw new Error("Desconto em valor não pode ser negativo");
    }

    this.props.valorSubtotal = valorSubtotal;
    this.props.descontoPercentual = descontoPercentual;
    this.props.descontoValor = descontoValor;
    this.props.valorTotal = valorSubtotal - descontoValor;
    this.props.updatedAt = new Date();
  }

  /**
   * Atualiza tipo de pagamento
   */
  atualizarTipoPagamento(tipo: OrcamentoProps["tipoPagamento"]): void {
    if (!this.podeSerEditado()) {
      throw new Error("Apenas orçamentos em RASCUNHO podem ser editados");
    }

    this.props.tipoPagamento = tipo;
    this.props.updatedAt = new Date();
  }

  /**
   * Estende validade do orçamento
   */
  estenderValidade(diasAdicionais: number): void {
    if (diasAdicionais <= 0) {
      throw new Error("Dias adicionais deve ser maior que zero");
    }

    if (this.props.status !== "PENDENTE") {
      throw new Error(
        "Apenas orçamentos PENDENTES podem ter validade estendida",
      );
    }

    const novaDataExpiracao = new Date(this.props.dataExpiracao);
    novaDataExpiracao.setDate(novaDataExpiracao.getDate() + diasAdicionais);

    this.props.dataExpiracao = novaDataExpiracao;
    this.props.validadeDias += diasAdicionais;
    this.props.updatedAt = new Date();
  }

  /**
   * Calcula dias até expiração
   */
  getDiasAteExpiracao(): number {
    const hoje = new Date();
    const diff = this.props.dataExpiracao.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica se está prestes a expirar (7 dias ou menos)
   */
  isPresteAExpirar(): boolean {
    return this.getDiasAteExpiracao() <= 7 && this.getDiasAteExpiracao() > 0;
  }

  /**
   * Converte para objeto plano
   */
  toObject(): OrcamentoProps {
    return { ...this.props };
  }
}
