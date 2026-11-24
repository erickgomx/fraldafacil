/**
 * ============================================================================
 * SERVIÇO DE DISPACHO DE E-MAILS (Fralda Online)
 * ============================================================================
 * Responsável pela composição visual e entrega de e-mails transacionais:
 * - Recuperação de senha
 * - Boas-vindas na criação da página do chá
 * - Notificação aos pais quando um presente é aprovado
 * - Comprovante ao convidado (incluindo Número da Sorte quando houver)
 *
 * Arquitetura de envio:
 * - Utiliza a API REST oficial do Resend via chamada nativa `fetch` com timeout de 5s.
 * - Sanitização automática anti-XSS em variáveis interpoladas no HTML.
 * - Tratamento inteligente de fallback: se o domínio principal `fralda.online` ainda estiver
 *   aguardando propagação de DNS, tenta automaticamente a entrega via `onboarding@resend.dev`.
 * - Em ambiente de desenvolvimento local (sem chave Resend), simula o disparo imprimindo
 *   o resumo diretamente no console do terminal.
 */

interface SendResetEmailInput {
  to: string;
  name: string;
  resetLink: string;
}

export interface SendWelcomeEventEmailInput {
  to: string;
  parentsName: string;
  slug: string;
  babyName?: string | null;
}

export interface SendParentGiftReceivedEmailInput {
  to: string;
  parentsNames: string;
  guestName: string;
  giftTitle: string;
  amountPaid: number;
  netAmount: number;
  paymentMethod: string;
  pollGuess?: string | null;
  message?: string | null;
  raffleTicketNumber?: number | null;
}

export interface SendGuestGiftConfirmationEmailInput {
  to: string | null | undefined;
  guestName: string;
  parentsNames: string;
  eventSlug: string;
  giftTitle: string;
  amountPaid: number;
  paymentMethod: string;
  message?: string | null;
  raffleTicketNumber?: number | null;
  rafflePrize?: string | null;
}

function getPublicAppBaseUrl(): string {
  const defaultBase = 'https://fralda.online';
  const envBase = process.env.NEXT_PUBLIC_APP_URL;
  return envBase && !envBase.includes('localhost') && !envBase.includes('vercel.app')
    ? envBase.replace(/\/$/, '')
    : defaultBase;
}

function formatBRL(value: number): string {
  return `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
}

function sanitizeSubjectSegment(text: string): string {
  return String(text || '').replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Sanitiza strings para interpolação segura em HTML, prevenindo ataques de HTML Injection / Email XSS.
 */
function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isDeliverableGuestEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return false;
  if (normalized === 'convidado@fralda.online') return false;
  if (normalized.endsWith('@anonimizado.invalid') || normalized.endsWith('@lgpd.invalid')) {
    return false;
  }
  return true;
}

function renderEmailLayout({
  title,
  bodyHtml,
}: {
  title: string;
  bodyHtml: string;
}): string {
  const safeTitle = escapeHtml(title);
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${safeTitle} — Fralda Online</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    @media (prefers-color-scheme: dark) {
      .dark-img { display: block !important; width: 64px !important; height: 64px !important; }
      .light-img { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(28, 25, 23, 0.04);">
          <tr>
            <td align="center" style="padding: 36px 32px 20px 32px; background: linear-gradient(180deg, #FAF7F2 0%, #FFFFFF 100%);">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://fralda.online" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        class="light-img"
                        src="https://fralda.online/logo-light.png"
                        width="64"
                        height="64"
                        alt="Fralda Online"
                        style="display: block; width: 64px; height: 64px; border: 0; outline: none; margin: 0 auto;"
                      />
                      <!--[if !mso]><!-->
                      <img
                        class="dark-img"
                        src="https://fralda.online/logo-dark.png"
                        width="64"
                        height="64"
                        alt="Fralda Online"
                        style="display: none; width: 0; height: 0; border: 0; outline: none; margin: 0 auto;"
                      />
                      <!--<![endif]-->
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

          <tr>
            <td style="padding: 12px 36px 36px 36px;">
              ${bodyHtml}
            </td>
          </tr>

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
}

async function dispatchResendEmail({
  to,
  subject,
  html,
  devSummary,
}: {
  to: string;
  subject: string;
  html: string;
  devSummary: string;
}): Promise<{ success: boolean; error?: string }> {
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
          subject,
          html,
        }),
        signal: AbortSignal.timeout(5000),
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
              subject,
              html,
            }),
            signal: AbortSignal.timeout(5000),
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

      console.log(`[Fralda Online] E-mail "${subject}" enviado com sucesso para: ${to}`);
      return { success: true };
    } catch (err) {
      console.error('Erro de conexão ao enviar e-mail via Resend:', err);
      return {
        success: false,
        error: 'Erro de conexão com o servidor de e-mails. Verifique sua conexão e tente novamente.',
      };
    }
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL SECURITY] RESEND_API_KEY não configurada no ambiente de produção.');
    return {
      success: false,
      error: 'Serviço de despacho de e-mails não configurado no servidor.',
    };
  }

  console.log('---------------------------------------------------------');
  console.log(`[Fralda Online][DEV] E-MAIL TRANSACIONAL: ${subject}`);
  console.log(`Destinatário: ${to}`);
  console.log(devSummary);
  console.log('---------------------------------------------------------');

  return { success: true };
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetLink,
}: SendResetEmailInput): Promise<{ success: boolean; error?: string }> {
  const safeFirstName = escapeHtml(name.split(' ')[0] || 'Futuro(a) Papai/Mamãe');
  const safeResetLink = escapeHtml(resetLink);

  const html = renderEmailLayout({
    title: 'Redefinição de Senha',
    bodyHtml: `
      <h2 style="margin: 0 0 14px 0; font-size: 18px; font-weight: 500; color: #1C1917;">
        Recuperação de Senha
      </h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #44403C;">
        Olá, <strong>${safeFirstName}</strong>!
      </p>
      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534E;">
        Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Fralda Online</strong>. Para criar sua nova senha com segurança, clique no botão abaixo:
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${safeResetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #1C1917; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
              Redefinir Minha Senha &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #78716C;">
        Se o botão não funcionar, você também pode copiar e colar o link abaixo no seu navegador:
      </p>
      <p style="margin: 6px 0 20px 0; font-size: 11px; word-break: break-all; color: #A8A29E; background: #FAF7F2; padding: 10px; border-radius: 8px; border: 1px solid #EFE8DC;">
        <a href="${safeResetLink}" style="color: #44403C; text-decoration: underline;">${safeResetLink}</a>
      </p>

      <div style="background-color: #FAF7F2; border-left: 3px solid #C5A059; padding: 12px 14px; border-radius: 4px; margin-top: 24px;">
        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #57534E;">
          🔒 <strong>Segurança:</strong> Este link é exclusivo, de uso único e expira em <strong>1 hora</strong>. Se você não solicitou a troca de senha, pode ignorar este e-mail tranquilamente &mdash; sua senha atual permanece protegida.
        </p>
      </div>
    `,
  });

  return dispatchResendEmail({
    to,
    subject: 'Redefinição de Senha — Fralda Online',
    html,
    devSummary: `Link seguro gerado (dev apenas): ${resetLink}`,
  });
}

export async function sendWelcomeEventEmail({
  to,
  parentsName,
  slug,
  babyName,
}: SendWelcomeEventEmailInput): Promise<{ success: boolean; error?: string }> {
  const baseUrl = getPublicAppBaseUrl();
  const publicUrl = `${baseUrl}/${encodeURIComponent(slug)}`;
  const configUrl = `${baseUrl}/painel/configuracoes`;
  const safeParents = escapeHtml(parentsName || 'Futuros Papais');
  const safePublicUrl = escapeHtml(publicUrl);
  const safeConfigUrl = escapeHtml(configUrl);
  const safeBaby = babyName ? escapeHtml(babyName) : null;

  const html = renderEmailLayout({
    title: 'Sua página de chá está pronta',
    bodyHtml: `
      <h2 style="margin: 0 0 14px 0; font-size: 18px; font-weight: 500; color: #1C1917;">
        Seja bem-vindo(a) ao Fralda Online!
      </h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #44403C;">
        Olá, <strong>${safeParents}</strong>!${safeBaby ? ` A página do chá de <strong>${safeBaby}</strong> já está no ar.` : ' A página do seu chá já está no ar.'}
      </p>

      <div style="background-color: #FAF7F2; border: 1px solid #E7E2DA; border-radius: 12px; padding: 14px 16px; margin: 18px 0;">
        <span style="display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #78716C; margin-bottom: 4px;">
          Link da sua página pública
        </span>
        <a href="${safePublicUrl}" target="_blank" style="font-size: 13px; font-weight: 600; color: #1C1917; word-break: break-all; text-decoration: underline;">
          ${safePublicUrl}
        </a>
      </div>

      <p style="margin: 18px 0 8px 0; font-size: 13px; font-weight: 600; color: #1C1917;">
        Checklist rápido em 3 passos para começar a receber:
      </p>
      <ol style="margin: 0 0 22px 0; padding-left: 18px; font-size: 13px; line-height: 1.7; color: #57534E;">
        <li><strong>Conecte seu Mercado Pago</strong> em Configurações para receber os presentes direto na sua conta.</li>
        <li><strong>Personalize os presentes</strong> ou ative o <em>Sorteio entre Presenteadores</em> se desejar.</li>
        <li><strong>Compartilhe no WhatsApp</strong> com amigos e familiares.</li>
      </ol>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0 10px 0;">
        <tr>
          <td align="center">
            <a href="${safeConfigUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #1C1917; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 10px;">
              Conectar Mercado Pago &amp; Configurar &rarr;
            </a>
          </td>
        </tr>
      </table>
    `,
  });

  return dispatchResendEmail({
    to,
    subject: 'Sua página de chá está pronta — Fralda Online',
    html,
    devSummary: `Página criada: ${publicUrl} | Configurar em: ${configUrl}`,
  });
}

export async function sendParentGiftReceivedEmail({
  to,
  parentsNames,
  guestName,
  giftTitle,
  amountPaid,
  netAmount,
  paymentMethod,
  pollGuess,
  message,
  raffleTicketNumber,
}: SendParentGiftReceivedEmailInput): Promise<{ success: boolean; error?: string }> {
  const baseUrl = getPublicAppBaseUrl();
  const dashboardUrl = `${baseUrl}/painel`;
  const safeParents = escapeHtml(parentsNames || 'Papais');
  const safeGuest = escapeHtml(guestName || 'Convidado Especial');
  const safeGift = escapeHtml(giftTitle || 'Presente em Dinheiro');
  const safeSubjectGuest = sanitizeSubjectSegment(guestName || 'Convidado Especial');
  const methodLabel = paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'Pix';
  const guessLabel =
    pollGuess === 'BOY' ? 'Menino 💙' : pollGuess === 'GIRL' ? 'Menina 🌸' : null;
  const safeMessage = message && message.trim() ? escapeHtml(message.trim()) : null;
  const ticketLabel =
    typeof raffleTicketNumber === 'number'
      ? `Nº #${String(raffleTicketNumber).padStart(3, '0')}`
      : null;

  const html = renderEmailLayout({
    title: 'Novo Presente Recebido',
    bodyHtml: `
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 500; color: #1C1917;">
        🎉 Você recebeu um novo presente!
      </h2>
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #44403C;">
        Olá, <strong>${safeParents}</strong>! <strong>${safeGuest}</strong> acabou de enviar um mimo para o seu bebê.
      </p>

      <div style="background-color: #FAF7F2; border: 1px solid #E7E2DA; border-radius: 14px; padding: 16px 18px; margin-bottom: 18px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #44403C;">
          <strong>Presente:</strong> ${safeGift}
        </p>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #44403C;">
          <strong>Valor líquido para vocês:</strong> <span style="color: #15803D; font-weight: 700;">${escapeHtml(formatBRL(netAmount))}</span>
          <span style="color: #78716C; font-size: 12px;"> (pago no ${escapeHtml(methodLabel)}: ${escapeHtml(formatBRL(amountPaid))})</span>
        </p>
        ${
          guessLabel
            ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #44403C;"><strong>Palpite no Bolão:</strong> ${escapeHtml(guessLabel)}</p>`
            : ''
        }
        ${
          ticketLabel
            ? `<p style="margin: 0; font-size: 13px; color: #44403C;"><strong>Número da Sorte gerado:</strong> <span style="font-family: monospace; font-weight: 700;">${escapeHtml(ticketLabel)}</span></p>`
            : ''
        }
      </div>

      ${
        safeMessage
          ? `
        <div style="background-color: #FFFFFF; border-left: 3px solid #C2765B; border-top: 1px solid #E7E2DA; border-right: 1px solid #E7E2DA; border-bottom: 1px solid #E7E2DA; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
          <span style="display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #78716C; margin-bottom: 6px;">
            Recado deixado no mural
          </span>
          <p style="margin: 0; font-size: 13px; font-style: italic; line-height: 1.6; color: #44403C;">
            &ldquo;${safeMessage}&rdquo;
          </p>
        </div>
      `
          : ''
      }

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0 8px 0;">
        <tr>
          <td align="center">
            <a href="${escapeHtml(dashboardUrl)}" target="_blank" style="display: inline-block; padding: 13px 28px; background-color: #1C1917; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 10px;">
              Abrir Meu Painel &rarr;
            </a>
          </td>
        </tr>
      </table>
    `,
  });

  return dispatchResendEmail({
    to,
    subject: `Novo presente recebido de ${safeSubjectGuest} — Fralda Online`,
    html,
    devSummary: `Presente: ${giftTitle} | Líquido: ${formatBRL(netAmount)} | Ticket: ${ticketLabel || 'N/A'}`,
  });
}

export async function sendGuestGiftConfirmationEmail({
  to,
  guestName,
  parentsNames,
  eventSlug,
  giftTitle,
  amountPaid,
  paymentMethod,
  message,
  raffleTicketNumber,
  rafflePrize,
}: SendGuestGiftConfirmationEmailInput): Promise<{ success: boolean; error?: string }> {
  if (!isDeliverableGuestEmail(to)) {
    return { success: true };
  }

  const targetEmail = (to as string).trim();
  const baseUrl = getPublicAppBaseUrl();
  const eventUrl = `${baseUrl}/${encodeURIComponent(eventSlug)}`;
  const safeGuest = escapeHtml(guestName || 'Convidado(a)');
  const safeParents = escapeHtml(parentsNames || 'Papais');
  const safeGift = escapeHtml(giftTitle || 'Presente em Dinheiro');
  const methodLabel = paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'Pix';
  const safeMessage = message && message.trim() ? escapeHtml(message.trim()) : null;
  const paddedTicket =
    typeof raffleTicketNumber === 'number'
      ? String(raffleTicketNumber).padStart(3, '0')
      : null;

  const subject = paddedTicket
    ? `Presente confirmado + Seu Número da Sorte #${paddedTicket} — Fralda Online`
    : `Presente confirmado para ${sanitizeSubjectSegment(parentsNames || 'os pais')} — Fralda Online`;

  const html = renderEmailLayout({
    title: 'Presente Confirmado',
    bodyHtml: `
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 500; color: #1C1917;">
        Obrigado pelo seu carinho, ${safeGuest}!
      </h2>
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #44403C;">
        Seu presente para o chá de <strong>${safeParents}</strong> foi confirmado com sucesso.
      </p>

      <div style="background-color: #FAF7F2; border: 1px solid #E7E2DA; border-radius: 14px; padding: 16px 18px; margin-bottom: 18px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #44403C;">
          <strong>Presente escolhido:</strong> ${safeGift}
        </p>
        <p style="margin: 0; font-size: 13px; color: #44403C;">
          <strong>Valor pago (${escapeHtml(methodLabel)}):</strong> ${escapeHtml(formatBRL(amountPaid))}
        </p>
      </div>

      ${
        paddedTicket
          ? `
        <div style="background-color: #FFFBF7; border: 2px solid #C2765B; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 20px;">
          <span style="display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #C2765B; font-weight: 700; margin-bottom: 6px;">
            Seu Número da Sorte Oficial
          </span>
          <strong style="display: block; font-size: 28px; font-family: monospace; color: #1C1917; margin: 4px 0;">
            Nº #${escapeHtml(paddedTicket)}
          </strong>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #57534E;">
            ${
              rafflePrize && rafflePrize.trim()
                ? `Você já está concorrendo a: <strong>${escapeHtml(rafflePrize.trim())}</strong>.`
                : 'Você já está concorrendo ao sorteio do chá!'
            }
          </p>
        </div>
      `
          : ''
      }

      ${
        safeMessage
          ? `
        <div style="background-color: #FAF7F2; border-left: 3px solid #1C1917; padding: 12px 14px; border-radius: 6px; margin-bottom: 20px;">
          <span style="display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #78716C; margin-bottom: 4px;">
            Seu recado publicado no mural
          </span>
          <p style="margin: 0; font-size: 12px; font-style: italic; line-height: 1.5; color: #44403C;">
            &ldquo;${safeMessage}&rdquo;
          </p>
        </div>
      `
          : ''
      }

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0 8px 0;">
        <tr>
          <td align="center">
            <a href="${escapeHtml(eventUrl)}" target="_blank" style="display: inline-block; padding: 13px 28px; background-color: #1C1917; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 10px;">
              Voltar à Página do Chá &rarr;
            </a>
          </td>
        </tr>
      </table>
    `,
  });

  return dispatchResendEmail({
    to: targetEmail,
    subject,
    html,
    devSummary: `Comprovante convidado | Presente: ${giftTitle} | Número da Sorte: ${paddedTicket ? `#${paddedTicket}` : 'N/A'}`,
  });
}
