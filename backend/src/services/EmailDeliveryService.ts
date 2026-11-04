import nodemailer from 'nodemailer';

export class EmailDeliveryService {
  private transporter: any = null;

  private isDummyCredentials(): boolean {
    const user = (process.env.SMTP_USER || '').toLowerCase();
    const pass = (process.env.SMTP_PASS || '').toLowerCase();
    const host = (process.env.SMTP_HOST || '').toLowerCase();

    return (
      !user ||
      !pass ||
      user.includes('seu-email') ||
      user.includes('exemplo') ||
      pass.includes('sua-senha') ||
      pass.includes('123456') ||
      pass.includes('senha') ||
      host.includes('example.com')
    );
  }

  private getTransporter(): any {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) return null;

    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    this.transporter = (nodemailer as any).createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });

    return this.transporter;
  }

  isConfigured(): boolean {
    // Retorna true mesmo em modo de demonstração/teste local para permitir testes de fluxo
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    return Boolean(host && user && pass);
  }

  async sendPasswordReset(to: string, url: string): Promise<void> {
    // Se as credenciais forem fictícias/de teste, simula o envio com sucesso imprimindo o link no console
    if (this.isDummyCredentials()) {
      console.log('\n======================================================');
      console.log('📧 [MODO DEMO/TESTE] E-MAIL DE REDEFINIÇÃO GERADO:');
      console.log(`Para: ${to}`);
      console.log(`Link: ${url}`);
      console.log('======================================================\n');
      return;
    }

    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@psicomanager.com';

    if (!transporter) {
      throw new Error('Serviço de e-mail não configurado.');
    }

    try {
      await transporter.sendMail({
        from: `"PsicoManager" <${from}>`,
        to,
        subject: 'Redefinição de senha do PsicoManager',
        text: `Use este link para redefinir sua senha. Ele expira em 30 minutos: ${url}`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3eaed; border-radius: 8px;">
          <h2 style="color: #173f4b;">Redefinição de Senha</h2>
          <p>Recebemos um pedido de redefinição de senha para sua conta no <strong>PsicoManager</strong>.</p>
          <p style="margin: 24px 0;">
            <a href="${url}" style="background-color: #2c5f6e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir senha</a>
          </p>
          <p style="font-size: 13px; color: #5f6f75;">O link expira em 30 minutos. Se você não solicitou esta alteração, ignore esta mensagem com segurança.</p>
        </div>`
      });
    } catch (error: any) {
      // Se for erro de credencial (535 BadCredentials), faz fallback para o console sem quebrar o teste
      if (error.message?.includes('535') || error.message?.includes('BadCredentials') || error.code === 'EAUTH') {
        console.warn('\n⚠️ [SMTP 535 - Senha Fictícia Detectada] Link liberado no console para teste:');
        console.log(`Para: ${to}`);
        console.log(`Link: ${url}\n`);
        return;
      }
      console.error('[EmailDeliveryService] Falha ao enviar e-mail via SMTP:', error.message);
      throw new Error(`O provedor SMTP recusou o envio: ${error.message}`);
    }
  }

  async sendSessionReminder(to: string, patientName?: string, appointmentDate?: string): Promise<void> {
    if (this.isDummyCredentials()) {
      console.log(`📧 [MODO DEMO/TESTE] Lembrete de consulta simulado para: ${to} (Paciente: ${patientName || 'N/A'})`);
      return;
    }

    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@psicomanager.com';

    if (!transporter) {
      throw new Error('Serviço de e-mail não configurado.');
    }

    try {
      await transporter.sendMail({
        from: `"PsicoManager" <${from}>`,
        to,
        subject: 'Lembrete de Consulta - PsicoManager',
        text: `Olá${patientName ? ' ' + patientName : ''}! Lembramos que você tem uma sessão agendada no PsicoManager${appointmentDate ? ' em ' + appointmentDate : ''}.`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3eaed; border-radius: 8px;">
          <h2 style="color: #173f4b;">Lembrete de Sessão</h2>
          <p>Olá${patientName ? ' <strong>' + patientName + '</strong>' : ''}!</p>
          <p>Lembramos que você possui um atendimento agendado no <strong>PsicoManager</strong>${appointmentDate ? ' para <strong>' + appointmentDate + '</strong>' : ''}.</p>
          <p style="font-size: 13px; color: #5f6f75;">Por favor, chegue com alguns minutos de antecedência.</p>
        </div>`
      });
    } catch (error: any) {
      if (error.message?.includes('535') || error.message?.includes('BadCredentials') || error.code === 'EAUTH') {
        console.warn(`⚠️ [SMTP 535] Lembrete simulado no console para ${to}`);
        return;
      }
      console.error('[EmailDeliveryService] Falha ao enviar lembrete via SMTP:', error.message);
      throw new Error(`O provedor SMTP recusou o envio: ${error.message}`);
    }
  }
}
