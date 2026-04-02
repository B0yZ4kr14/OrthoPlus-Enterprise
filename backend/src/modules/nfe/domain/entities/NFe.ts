export class NFe {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public numero: string,
    public serie: string,
    public tipo: string,
    public status: string,
    public chaveAcesso: string | null,
    public xml: string | null,
    public pdfUrl: string | null,
    public clienteId: string,
    public clienteNome: string,
    public valorTotal: number,
    public dataEmissao: Date,
    public protocolo: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: Omit<NFe, 'cancelar'>): NFe {
    return new NFe(
      props.id,
      props.clinicId,
      props.numero,
      props.serie,
      props.tipo,
      props.status,
      props.chaveAcesso,
      props.xml,
      props.pdfUrl,
      props.clienteId,
      props.clienteNome,
      props.valorTotal,
      props.dataEmissao,
      props.protocolo,
      props.createdAt,
      props.updatedAt
    );
  }

  cancelar(): void {
    if (this.status !== 'AUTORIZADA') {
      throw new Error('Apenas NFe autorizada pode ser cancelada');
    }
    this.status = 'CANCELADA';
    this.updatedAt = new Date();
  }
}
