export class Transaction {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public type: 'RECEITA' | 'DESPESA',
    public category: string,
    public amount: number,
    public description: string,
    public dueDate: Date,
    public status: 'PENDENTE' | 'PAGO' | 'CANCELADO',
    public patientId: string | null,
    public appointmentId: string | null,
    public paymentMethod: string | null,
    public paidAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: Omit<Transaction, 'markAsPaid' | 'cancel'>): Transaction {
    return new Transaction(
      props.id,
      props.clinicId,
      props.type,
      props.category,
      props.amount,
      props.description,
      props.dueDate,
      props.status,
      props.patientId,
      props.appointmentId,
      props.paymentMethod,
      props.paidAt,
      props.createdAt,
      props.updatedAt
    );
  }

  markAsPaid(paymentMethod: string): void {
    if (this.status === 'CANCELADO') {
      throw new Error('Não é possível pagar uma transação cancelada');
    }
    this.status = 'PAGO';
    this.paymentMethod = paymentMethod;
    this.paidAt = new Date();
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this.status === 'PAGO') {
      throw new Error('Não é possível cancelar uma transação paga');
    }
    this.status = 'CANCELADO';
    this.updatedAt = new Date();
  }
}
