/**
 * Utilitário central de compartilhamento oficial do Fralda Online
 * Garante link canônico https://fralda.online/{slug} e mensagens ricas com emojis.
 */

export interface ShareDataInput {
  slug: string;
  parentsNames: string;
  babyName?: string | null;
  boyName?: string | null;
  girlName?: string | null;
  eventType?: string;
}

export function buildSharePayload(input: ShareDataInput) {
  const defaultBase = 'https://fralda.online';
  const envBase = process.env.NEXT_PUBLIC_APP_URL;
  // Garante que se a env apontar para localhost ou vercel em dev, em prod ou fallback use fralda.online
  const baseUrl = (envBase && !envBase.includes('localhost') && !envBase.includes('vercel.app'))
    ? envBase
    : defaultBase;

  const url = `${baseUrl.replace(/\/$/, '')}/${input.slug}`;

  let title = `Chá de Bebê de ${input.parentsNames}`;
  let message = '';

  if (input.eventType === 'REVELACAO' && input.boyName && input.girlName) {
    title = `Chá Revelação: ${input.boyName} ou ${input.girlName}?`;
    message = `Oi! Preparamos a página do nosso *Chá Revelação* com muito carinho (${input.parentsNames}). ✨\n\nSerá *${input.boyName}* ou *${input.girlName}*? Deixe seu palpite no bolão e veja nossa lista de fraldas aqui:\n${url}`;
  } else if (input.babyName || input.boyName || input.girlName) {
    const name = input.babyName || input.boyName || input.girlName;
    title = `Chá de Bebê de ${name}`;
    message = `Oi! Preparamos a página do Chá de Bebê de *${name}* com muito carinho (${input.parentsNames}). ✨\n\nPara deixar um recado para a gente e ver nossa lista de fraldas, é só acessar aqui:\n${url}`;
  } else {
    title = `Chá de Bebê de ${input.parentsNames}`;
    message = `Oi! Preparamos a página do nosso Chá de Bebê com muito carinho (${input.parentsNames}). ✨\n\nPara participar, deixar um recado e ver nossa lista de fraldas, é só acessar aqui:\n${url}`;
  }

  return { title, message, url };
}

export async function shareEvent(input: ShareDataInput): Promise<'SHARED' | 'COPIED' | 'CANCELLED'> {
  const { title, message } = buildSharePayload(input);

  if (typeof window !== 'undefined') {
    // Tenta compartilhamento nativo no celular (abre WhatsApp / Apps)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: message,

        });
        return 'SHARED';
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return 'CANCELLED';
        }
      }
    }

    // Fallback seguro: copia mensagem formatada completa com emojis e link para a área de transferência
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      return 'COPIED';
    }
  }

  return 'COPIED';
}
