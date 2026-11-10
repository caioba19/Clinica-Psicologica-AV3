export interface DueReminder {
  id: string;
  email: string;
  inicio: string;
  pacienteNome?: string;
}

export interface ReminderRepository {
  findDueEmailReminders(): Promise<DueReminder[]>;
  markEmailReminderSent(id: string): Promise<void>;
}

export interface Mailer {
  isConfigured(): boolean;
  sendSessionReminder(to: string, patientName?: string, appointmentDate?: string): Promise<void>;
}

export class EmailReminderService {
  constructor(
    private repository: ReminderRepository,
    private mailer: Mailer
  ) {}

  async sendDueReminders(): Promise<number> {
    if (!this.mailer.isConfigured()) return 0;

    const dueList = await this.repository.findDueEmailReminders();
    let sentCount = 0;

    for (const reminder of dueList) {
      try {
        await this.mailer.sendSessionReminder(reminder.email, reminder.pacienteNome, reminder.inicio);
        await this.repository.markEmailReminderSent(reminder.id);
        sentCount++;
      } catch (error) {
        console.error(`[EmailReminderService] Falha ao enviar lembrete para agendamento ${reminder.id}:`, error);
      }
    }

    return sentCount;
  }
}
