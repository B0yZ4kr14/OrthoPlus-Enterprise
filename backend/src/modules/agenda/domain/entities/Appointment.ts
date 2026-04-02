export class Appointment {
  id!: string;
  clinicId!: string;
  patientId!: string;
  dentistId!: string;
  startTime!: Date;
  endTime!: Date;
  status!: string;
  type!: string;
  notes?: string;
  createdBy!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static create(props: any): Appointment {
    return Object.assign(new Appointment(), props);
  }

  start() { this.status = 'EM_ANDAMENTO'; }
  confirm() { this.status = 'CONFIRMADO'; }
  complete() { this.status = 'CONCLUIDO'; }
  cancel() { this.status = 'CANCELADO'; }
  markNoShow() { this.status = 'NAO_COMPARECEU'; }
}
