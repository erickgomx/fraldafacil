/**
 * ============================================================================
 * UTILITÁRIO CENTRAL DE COMPARTILHAMENTO (lib/share.ts)
 * ============================================================================
 * Gera mensagens ricas, afetivas e esteticamente diagramadas com emojis e
 * bullet points para compartilhamento no WhatsApp, Web Share API e Clipboard.
 */

export interface ShareDataInput {
  slug: string;
  parentsNames: string;
  babyName?: string | null;
  boyName?: string | null;
  girlName?: string | null;
  eventType?: string;
  revealedGender?: string | null;
}

export function buildSharePayload(input: ShareDataInput) {
  const defaultBase = 'https://fralda.online';
  const envBase = process.env.NEXT_PUBLIC_APP_URL;
  // Garante que se a env apontar para localhost ou vercel em dev, em prod ou fallback use fralda.online
  const baseUrl =
    envBase && !envBase.includes('localhost') && !envBase.includes('vercel.app')
      ? envBase
      : defaultBase;

  const url = `${baseUrl.replace(/\/$/, '')}/${input.slug}`;

  let title = `Chá de Bebê de ${input.parentsNames}`;
  let message = '';

  // 1. CHÁ REVELAÇÃO JÁ REVELADO - MENINO
  if (input.revealedGender === 'BOY') {
    const name = input.boyName || input.babyName || 'nosso príncipe';
    title = `É Menino! Chá de Bebê de ${name} (${input.parentsNames})`;
    message = `🎉💙 *É MENINO! CHÁ DO ${name.toUpperCase()}* 🍼✨

A revelação aconteceu e a nossa felicidade não cabe no peito! Nosso príncipe *${name}* está a caminho! 👦💙

Preparamos uma página linda para celebrar juntos:
🎁 *Lista de fraldas e mimos* (fácil, seguro e direto via Pix)
💌 *Mural de recados* para deixar seus votos de carinho
🧸 *Celebrar com a gente* esse momento tão abençoado

Toque no link abaixo para visitar a página e deixar seu recado:
👇👇👇
${url}

Com todo amor,
*${input.parentsNames}* 🥰`;
  }
  // 2. CHÁ REVELAÇÃO JÁ REVELADO - MENINA
  else if (input.revealedGender === 'GIRL') {
    const name = input.girlName || input.babyName || 'nossa princesa';
    title = `É Menina! Chá de Bebê de ${name} (${input.parentsNames})`;
    message = `🎉💖 *É MENINA! CHÁ DA ${name.toUpperCase()}* 🍼✨

A revelação aconteceu e nosso coração está transbordando de amor! Nossa princesinha *${name}* está a caminho! 👧💖

Preparamos uma página linda para celebrar juntos:
🎁 *Lista de fraldas e mimos* (fácil, seguro e direto via Pix)
💌 *Mural de recados* para deixar seus votos de carinho
🧸 *Celebrar com a gente* esse momento tão abençoado

Toque no link abaixo para visitar a página e deixar seu recado:
👇👇👇
${url}

Com todo amor,
*${input.parentsNames}* 🥰`;
  }
  // 3. CHÁ REVELAÇÃO ATIVO (EM ANDAMENTO COM BOLÃO)
  else if (input.eventType === 'REVELACAO' || (input.boyName && input.girlName)) {
    const boy = input.boyName || 'Menino';
    const girl = input.girlName || 'Menina';
    title = `Chá Revelação: ${boy} ou ${girl}? (${input.parentsNames})`;
    message = `✨🍼 *CONVITE: CHÁ REVELAÇÃO* 🍼✨

Oi, família e amigos! Preparamos com muito amor e carinho a página oficial do nosso *Chá Revelação*! 🤍

Será *${boy}* 💙 ou *${girl}* 💖?

Na nossa página especial você pode:
🎯 *Dar seu palpite no Bolão* (Será Menino ou Menina?)
🎁 *Escolher fraldas e presentes* para nos abençoar (via Pix direto)
💌 *Deixar uma mensagem linda* no nosso mural de carinho

Toque no link abaixo para deixar seu palpite e conferir tudo:
👇👇👇
${url}

Com todo carinho,
*${input.parentsNames}* 🥰`;
  }
  // 4. CHÁ DE BEBÊ COM NOME DEFINIDO
  else if (input.babyName || input.boyName || input.girlName) {
    const name = input.babyName || input.boyName || input.girlName || '';
    title = `Chá de Bebê de ${name} (${input.parentsNames})`;
    message = `🍼👶 *CONVITE: CHÁ DE BEBÊ DO(A) ${name.toUpperCase()}* ✨🤍

Oi, família e amigos queridos! Criamos com muito amor a página oficial do Chá de Bebê do nosso amor, *${name}*! 🍼

Tudo foi preparado com carinho para estarmos pertinho de quem amamos:
🎁 *Lista de fraldas e mimos* (prático, seguro e direto via Pix)
💌 *Mural de carinho* para deixar seus recados e votos para o bebê
🧸 *Celebrar juntos* a espera mais especial da nossa vida

Toque no link abaixo para ver a página e deixar sua mensagem:
👇👇👇
${url}

Com muito amor,
*${input.parentsNames}* 🥰`;
  }
  // 5. CHÁ DE BEBÊ GERAL (PELOS NOMES DOS PAIS)
  else {
    title = `Chá de Bebê de ${input.parentsNames}`;
    message = `🍼✨ *CONVITE ESPECIAL: NOSSO CHÁ DE BEBÊ* ✨🤍

Oi, família e amigos queridos! Preparamos com todo o amor do mundo a página oficial do nosso Chá de Bebê! 🍼

Criamos um cantinho especial para você fazer parte desse momento:
🎁 *Lista de fraldas e presentes* (prático, seguro e direto via Pix)
💌 *Mural de carinho* para deixar sua mensagem para a nossa família
🧸 *Celebrar juntos* a chegada do nosso maior presente

Toque no link abaixo para conferir e participar:
👇👇👇
${url}

Com muito carinho,
*${input.parentsNames}* 🥰`;
  }

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  return { title, message, url, whatsappUrl };
}

export async function shareEvent(
  input: ShareDataInput
): Promise<'SHARED' | 'COPIED' | 'CANCELLED'> {
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
