export type ReminderStatus =
  | "PENDENTE"
  | "ENVIADA"
  | "CONFIRMADA"
  | "ERRO"
  | "CANCELADA";
export type ReminderType = "CONFIRMACAO" | "LEMBRETE" | "RECALL";

export class AppointmentReminder {
  id!: string;
  appointmentId!: string;
  messageTemplate!: string;
  reminderType!: ReminderType;
  scheduledFor!: Date;
  status!: ReminderStatus;
  sentAt?: Date;
  errorMessage?: string;
  phoneNumber?: string;
  createdAt!: Date;

  static create(props: {
    appointmentId: string;
    messageTemplate: string;
    reminderType: ReminderType;
    scheduledFor: Date;
    phoneNumber?: string;
  }): AppointmentReminder {
    const reminder = new AppointmentReminder();
    reminder.id = crypto.randomUUID();
    reminder.appointmentId = props.appointmentId;
    reminder.messageTemplate = props.messageTemplate;
    reminder.reminderType = props.reminderType;
    reminder.scheduledFor = props.scheduledFor;
    reminder.status = "PENDENTE";
    reminder.phoneNumber = props.phoneNumber;
    reminder.createdAt = new Date();
    return reminder;
  }

  static restore(props: {
    id: string;
    appointmentId: string;
    messageTemplate: string;
    reminderType: ReminderType;
    scheduledFor: Date;
    status: ReminderStatus;
    sentAt?: Date;
    errorMessage?: string;
    phoneNumber?: string;
    createdAt: Date;
  }): AppointmentReminder {
    const reminder = new AppointmentReminder();
    Object.assign(reminder, props);
    return reminder;
  }

  enviar(): void {
    if (this.status !== "PENDENTE") {
      throw new Error("Apenas lembretes PENDENTES podem ser enviados");
    }
    this.status = "ENVIADA";
    this.sentAt = new Date();
  }

  confirmar(): void {
    if (this.status !== "ENVIADA") {
      throw new Error("Apenas lembretes ENVIADOS podem ser confirmados");
    }
    this.status = "CONFIRMADA";
  }

  marcarErro(errorMessage: string): void {
    this.status = "ERRO";
    this.errorMessage = errorMessage;
  }

  cancelar(): void {
    if (this.status === "CONFIRMADA") {
      throw new Error("Não é possível cancelar um lembrete já confirmado");
    }
    this.status = "CANCELADA";
  }
}
