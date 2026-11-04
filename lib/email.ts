/**
 * Serviço de e-mail do Fralda Online (fralda.online)
 * Suporta Resend oficial (nativo via fetch sem dependências extras) ou fallback em dev.
 */

interface SendResetEmailInput {
  to: string;
  name: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetLink,
}: SendResetEmailInput): Promise<{ success: boolean; error?: string }> {
  const firstName = name.split(' ')[0] || 'Futuro(a) Papai/Mamãe';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha — Fralda Online</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(28, 25, 23, 0.04);">
          <!-- Cabeçalho com Emblema da Marca -->
          <tr>
            <td align="center" style="padding: 36px 32px 20px 32px; background: linear-gradient(180deg, #FAF7F2 0%, #FFFFFF 100%);">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <!-- Logo Oficial Fralda Online -->
                    <a href="https://fralda.online" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="https://fralda.online/logo-card.png"
                        width="56"
                        height="56"
                        alt="Fralda Online"
                        style="display: block; width: 56px; height: 56px; border: 0; outline: none; margin: 0 auto;"
                      />
                    </a>
                    <h1 style="margin: 14px 0 2px 0; font-size: 22px; font-weight: 600; color: #1C1917; letter-spacing: -0.02em;">
                      Fralda Online
                    </h1>
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: #78716C; font-weight: 600;">
                      Chá de Bebê &amp; Revelação
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo da Mensagem -->
          <tr>
            <td style="padding: 12px 36px 36px 36px;">
              <h2 style="margin: 0 0 14px 0; font-size: 18px; font-weight: 500; color: #1C1917;">
                Recuperação de Senha
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #44403C;">
                Olá, <strong>${firstName}</strong>!
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534E;">
                Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Fralda Online</strong>. Para criar sua nova senha com segurança, clique no botão abaixo:
              </p>

              <!-- Botão CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #1C1917; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                      Redefinir Minha Senha &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link alternativo -->
              <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #78716C;">
                Se o botão não funcionar, você também pode copiar e colar o link abaixo no seu navegador:
              </p>
              <p style="margin: 6px 0 20px 0; font-size: 11px; word-break: break-all; color: #A8A29E; background: #FAF7F2; padding: 10px; border-radius: 8px; border: 1px solid #EFE8DC;">
                <a href="${resetLink}" style="color: #44403C; text-decoration: underline;">${resetLink}</a>
              </p>

              <!-- Aviso de Segurança -->
              <div style="background-color: #FAF7F2; border-left: 3px solid #C5A059; padding: 12px 14px; border-radius: 4px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #57534E;">
                  🔒 <strong>Segurança:</strong> Este link é exclusivo, de uso único e expira em <strong>1 hora</strong>. Se você não solicitou a troca de senha, pode ignorar este e-mail tranquilamente — sua senha atual permanece protegida.
                </p>
              </div>
            </td>
          </tr>

          <!-- Rodapé do E-mail -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F7F3EC; border-top: 1px solid #E7E2DA; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #78716C;">
                Fralda Online &mdash; Feito com carinho para os pais.
              </p>
              <p style="margin: 0; font-size: 10px; color: #A8A29E;">
                <a href="https://fralda.online" style="color: #78716C; text-decoration: underline;">fralda.online</a> &bull; São Paulo, Brasil
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // 1. Envio via API Oficial do Resend (se configurado)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const domain = process.env.RESEND_EMAIL_DOMAIN || 'fralda.online';
      const fromEmail = process.env.EMAIL_FROM || `Fralda Online <suporte@${domain}>`;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: 'Redefinição de Senha — Fralda Online',
          html: htmlContent,
        }),
      });

      let resendErrorMsg = '';

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.warn('[Fralda Online] Tentativa com remetente primário falhou:', errorData);
          resendErrorMsg = errorData?.message || errorData?.error || '';
        } catch {
          resendErrorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }

        // Se falhar porque o domínio ainda não foi verificado no DNS do Resend, tenta fallback de onboarding
        const isDomainNotVerified =
          resendErrorMsg.toLowerCase().includes('not verified') ||
          resendErrorMsg.toLowerCase().includes('domain');

        if (isDomainNotVerified) {
          console.log('[Fralda Online] Domínio não verificado no Resend. Tentando fallback com onboarding@resend.dev...');
          const fallbackResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Fralda Online <onboarding@resend.dev>',
              to: [to],
              subject: 'Redefinição de Senha — Fralda Online',
              html: htmlContent,
            }),
          });

          if (fallbackResponse.ok) {
            console.log(`[Fralda Online] E-mail enviado com sucesso via onboarding@resend.dev para: ${to}`);
            return { success: true };
          }

          try {
            const fallbackErrorData = await fallbackResponse.json();
            console.error('[Fralda Online] Fallback onboarding@resend.dev falhou:', fallbackErrorData);
            if (fallbackErrorData?.message) {
              resendErrorMsg = fallbackErrorData.message;
            }
          } catch {
            // mantém resendErrorMsg anterior
          }
        }

        // Mensagens explicativas e acionáveis para o usuário
        let userFriendlyMsg = resendErrorMsg;
        if (
          resendErrorMsg.toLowerCase().includes('not verified') ||
          resendErrorMsg.toLowerCase().includes('domain')
        ) {
          userFriendlyMsg =
            'O domínio fralda.online ainda não foi verificado no Resend. Adicione os registros DNS no seu registrador de domínio ou clique em "Verify" no painel do Resend.';
        } else if (
          resendErrorMsg.toLowerCase().includes('testing emails to your own email address') ||
          resendErrorMsg.toLowerCase().includes('only send testing')
        ) {
          userFriendlyMsg =
            'O domínio fralda.online precisa ser verificado no Resend. Em modo de teste, o Resend só entrega para o e-mail do titular da conta no Resend.';
        } else if (resendErrorMsg.toLowerCase().includes('api key')) {
          userFriendlyMsg =
            'A chave RESEND_API_KEY informada na Vercel é inválida ou não possui permissão de envio.';
        }

        return {
          success: false,
          error: userFriendlyMsg || 'Falha ao despachar e-mail via serviço Resend.',
        };
      }

      console.log(`[Fralda Online] E-mail de redefinição enviado com sucesso para: ${to}`);
      return { success: true };
    } catch (err) {
      console.error('Erro de conexão ao enviar e-mail via Resend:', err);
      return {
        success: false,
        error: 'Erro de conexão com o servidor de e-mails. Verifique sua conexão e tente novamente.',
      };
    }
  }

  // 2. Fallback de Desenvolvimento / Notificação no Console
  console.log('---------------------------------------------------------');
  console.log(`[Fralda Online] SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA`);
  console.log(`Destinatário: ${to} (${name})`);
  console.log(`Link seguro gerado: ${resetLink}`);
  console.log(`(Configure RESEND_API_KEY no .env para envio automático em produção)`);
  console.log('---------------------------------------------------------');

  return { success: true };
}
