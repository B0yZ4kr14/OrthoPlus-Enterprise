/**
 * Prontuario Entity (PEP Module)
 * Aggregate Root para Prontuário Eletrônico do Paciente
 */

export interface ProntuarioProps {
  id: string;
  clinicId: string;
  patientId: string;
  dentistaId: string;
  dataConsulta: Date;
  motivoConsulta: string;
  anamnese?: string;
  exameFisico?: string;
  diagnostico?: string;
  planoDeTratamento?: string;
  observacoes?: string;
  anexos?: string[]; // URLs de arquivos anexados
  assinadoDigitalmente: boolean;
  assinaturaHash?: string;
  assinadoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Prontuario {
  private props: ProntuarioProps;

  private constructor(props: ProntuarioProps) {
    this.props = props;
  }

  static create(props: Omit<ProntuarioProps, 'id' | 'assinadoDigitalmente' | 'createdAt' | 'updatedAt'>): Prontuario {
    return new Prontuario({
      ...props,
      id: crypto.randomUUID(),
      assinadoDigitalmente: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: ProntuarioProps): Prontuario {
    return new Prontuario(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get clinicId(): string { return this.props.clinicId; }
  get patientId(): string { return this.props.patientId; }
  get assinadoDigitalmente(): boolean { return this.props.assinadoDigitalmente; }

  // Domain methods
  assinarDigitalmente(hash: string): void {
    if (this.props.assinadoDigitalmente) {
      throw new Error('Prontuário já foi assinado digitalmente');
    }

    this.props.assinadoDigitalmente = true;
    this.props.assinaturaHash = hash;
    this.props.assinadoEm = new Date();
    this.props.updatedAt = new Date();
  }

  adicionarAnexo(url: string): void {
    if (!this.props.anexos) {
      this.props.anexos = [];
    }

    this.props.anexos.push(url);
    this.props.updatedAt = new Date();
  }

  atualizarDiagnostico(diagnostico: string): void {
    if (this.props.assinadoDigitalmente) {
      throw new Error('Não é possível editar prontuário assinado digitalmente');
    }

    this.props.diagnostico = diagnostico;
    this.props.updatedAt = new Date();
  }

  atualizarPlanoDeTratamento(plano: string): void {
    if (this.props.assinadoDigitalmente) {
      throw new Error('Não é possível editar prontuário assinado digitalmente');
    }

    this.props.planoDeTratamento = plano;
    this.props.updatedAt = new Date();
  }

  toObject(): ProntuarioProps {
    return { ...this.props };
  }
}
