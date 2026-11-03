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
    title = `Chá Revelação: ${input.boyName} ou ${input.girlName}? 💙🌸`;
    message = `🍼✨ Você está convidado(a) para o nosso Chá Revelação! 👶🎉\n\nSerá ${input.boyName} ou ${input.girlName}? 💙🌸\nVenha dar o seu palpite no nosso Bolão Oficial e conferir a lista de fraldas!\n\n👉 Acesse a página aqui:\n${url}\n\nEsperamos você com muito carinho! 🥰🎉\n— ${input.parentsNames}`;
  } else if (input.babyName || input.boyName || input.girlName) {
    const name = input.babyName || input.boyName || input.girlName;
    title = `Chá de Bebê de ${name} 👶💛`;
    message = `🍼✨ Você está convidado(a) para o Chá de Bebê de ${name}! 👶💛\n\nPreparamos uma página linda com nossa lista de presentes em fraldas e mural de recados!\n\n👉 Acesse a página aqui:\n${url}\n\nEsperamos você com muito carinho! 🥰🎉\n— ${input.parentsNames}`;
  } else {
    title = `Chá de Bebê de ${input.parentsNames} 👶💛`;
    message = `🍼✨ Você está convidado(a) para o Chá de Bebê de ${input.parentsNames}! 👶💛\n\nPreparamos uma página linda com nossa lista de presentes em fraldas, bolão e mural de recados!\n\n👉 Acesse a página aqui:\n${url}\n\nEsperamos você com muito carinho! 🥰🎉\n— ${input.parentsNames}`;
  }

  return { title, message, url };
}

export async function shareEvent(input: ShareDataInput): Promise<'SHARED' | 'COPIED' | 'CANCELLED'> {
  const { title, message, url } = buildSharePayload(input);

  if (typeof window !== 'undefined') {
    // Tenta compartilhamento nativo no celular (abre WhatsApp / Apps)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: message,
          url,
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
