export class EmailDeliveryService {
  isConfigured(): boolean {
    return Boolean(process.env.EMAIL_API_KEY && process.env.EMAIL_FROM);
  }

  async sendPasswordReset(to: string, url: string): Promise<void> {
    const apiKey = process.env.EMAIL_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) throw new Error('Serviço de e-mail não configurado.');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'Redefinição de senha do PsicoManager',
        text: `Use este link para redefinir sua senha. Ele expira em 30 minutos: ${url}`,
        html: `<p>Recebemos um pedido de redefinição de senha.</p><p><a href="${url}">Redefinir senha</a></p><p>O link expira em 30 minutos. Se não solicitou esta alteração, ignore esta mensagem.</p>`
      })
    });
    if (!response.ok) throw new Error('O provedor não aceitou o e-mail de redefinição.');
  }
}
