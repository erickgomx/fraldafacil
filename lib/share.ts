/**
 * ============================================================================
 * UTILITÁRIO CENTRAL DE COMPARTILHAMENTO (lib/share.ts)
 * ============================================================================
 * Gera mensagens ricas, afetivas e esteticamente diagramadas com emojis e
 * bullet points para compartilhamento no WhatsApp, Web Share API e Clipboard
 * nos idiomas Português, Inglês e Espanhol.
 */

import type { Locale } from './i18n/types';

export interface ShareDataInput {
  slug: string;
  parentsNames: string;
  babyName?: string | null;
  boyName?: string | null;
  girlName?: string | null;
  eventType?: string;
  revealedGender?: string | null;
  locale?: Locale;
}

export function buildSharePayload(input: ShareDataInput) {
  const defaultBase = 'https://fralda.online';
  const envBase = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl =
    envBase && !envBase.includes('localhost') && !envBase.includes('vercel.app')
      ? envBase
      : defaultBase;

  const url = `${baseUrl.replace(/\/$/, '')}/${input.slug}`;
  const locale: Locale = input.locale || 'pt';

  let title = '';
  let message = '';

  if (locale === 'en') {
    if (input.revealedGender === 'BOY') {
      const name = input.boyName || input.babyName || 'our little prince';
      title = `It's a Boy! ${name}'s Baby Shower (${input.parentsNames})`;
      message = `🎉💙 *IT'S A BOY! WELCOME ${name.toUpperCase()}* 🍼✨

The reveal is out and our hearts are overflowing with joy! Our sweet boy *${name}* is on the way! 👦💙

We created a special page so we can celebrate together:
🎁 *Diaper & gift registry* (easy, secure, and straight to us)
💌 *Guestbook wall* to leave your warm wishes
🧸 *Celebrate with us* this blessed chapter

Tap the link below to visit our page and leave a message:
👇👇👇
${url}

With all our love,
*${input.parentsNames}* 🥰`;
    } else if (input.revealedGender === 'GIRL') {
      const name = input.girlName || input.babyName || 'our little princess';
      title = `It's a Girl! ${name}'s Baby Shower (${input.parentsNames})`;
      message = `🎉💖 *IT'S A GIRL! WELCOME ${name.toUpperCase()}* 🍼✨

The reveal is out and our hearts are bursting with love! Our sweet girl *${name}* is on the way! 👧💖

We created a special page so we can celebrate together:
🎁 *Diaper & gift registry* (easy, secure, and straight to us)
💌 *Guestbook wall* to leave your warm wishes
🧸 *Celebrate with us* this blessed chapter

Tap the link below to visit our page and leave a message:
👇👇👇
${url}

With all our love,
*${input.parentsNames}* 🥰`;
    } else if (input.eventType === 'REVELACAO' || (input.boyName && input.girlName)) {
      const boy = input.boyName || 'Boy';
      const girl = input.girlName || 'Girl';
      title = `Gender Reveal: ${boy} or ${girl}? (${input.parentsNames})`;
      message = `✨🍼 *INVITATION: GENDER REVEAL* 🍼✨

Hi family and friends! We lovingly put together the official page for our *Gender Reveal*! 🤍

Will it be *${boy}* 💙 or *${girl}* 💖?

On our page you can:
🎯 *Cast your vote in the Guessing Poll* (Team Boy or Team Girl?)
🎁 *Pick diapers & gifts* to bless our little one
💌 *Leave a sweet note* on our family guestbook wall

Tap the link below to place your vote and explore everything:
👇👇👇
${url}

With love,
*${input.parentsNames}* 🥰`;
    } else if (input.babyName || input.boyName || input.girlName) {
      const name = input.babyName || input.boyName || input.girlName || '';
      title = `${name}'s Baby Shower (${input.parentsNames})`;
      message = `🍼👶 *INVITATION: ${name.toUpperCase()}'S BABY SHOWER* ✨🤍

Hi dear family and friends! We lovingly created the official Baby Shower page for *${name}*! 🍼

Everything was prepared so we can feel close to the people we love:
🎁 *Diaper & gift list* (quick, easy, and secure)
💌 *Guestbook wall* for your blessings and loving wishes
🧸 *Celebrate together* the most special arrival of our lives

Tap the link below to view the page and leave your note:
👇👇👇
${url}

With lots of love,
*${input.parentsNames}* 🥰`;
    } else {
      title = `${input.parentsNames}'s Baby Shower`;
      message = `🍼✨ *SPECIAL INVITATION: OUR BABY SHOWER* ✨🤍

Hi dear family and friends! With all the love in the world, we created the official page for our Baby Shower! 🍼

Here is a cozy corner for you to be part of this moment:
🎁 *Diaper & gift registry* (simple, safe, and thoughtful)
💌 *Guestbook wall* to leave your loving message for our family
🧸 *Celebrate together* the arrival of our greatest blessing

Tap the link below to check it out and join in:
👇👇👇
${url}

With love,
*${input.parentsNames}* 🥰`;
    }
  } else if (locale === 'es') {
    if (input.revealedGender === 'BOY') {
      const name = input.boyName || input.babyName || 'nuestro príncipe';
      title = `¡Es Niño! Baby Shower de ${name} (${input.parentsNames})`;
      message = `🎉💙 *¡ES NIÑO! BABY SHOWER DE ${name.toUpperCase()}* 🍼✨

¡La revelación llegó y la felicidad no nos cabe en el pecho! ¡Nuestro príncipe *${name}* viene en camino! 👦💙

Preparamos una página especial para celebrar juntos:
🎁 *Lista de pañales y regalos* (fácil y segura)
💌 *Muro de mensajes* para dejar tus mejores deseos
🧸 *Celebrar con nosotros* este momento tan bendecido

Toca el enlace de abajo para visitar la página y dejar tu mensaje:
👇👇👇
${url}

Con todo nuestro amor,
*${input.parentsNames}* 🥰`;
    } else if (input.revealedGender === 'GIRL') {
      const name = input.girlName || input.babyName || 'nuestra princesa';
      title = `¡Es Niña! Baby Shower de ${name} (${input.parentsNames})`;
      message = `🎉💖 *¡ES NIÑA! BABY SHOWER DE ${name.toUpperCase()}* 🍼✨

¡La revelación llegó y nuestro corazón rebosa de amor! ¡Nuestra princesita *${name}* viene en camino! 👧💖

Preparamos una página especial para celebrar juntos:
🎁 *Lista de pañales y regalos* (fácil y segura)
💌 *Muro de mensajes* para dejar tus mejores deseos
🧸 *Celebrar con nosotros* este momento tan bendecido

Toca el enlace de abajo para visitar la página y dejar tu mensaje:
👇👇👇
${url}

Con todo nuestro amor,
*${input.parentsNames}* 🥰`;
    } else if (input.eventType === 'REVELACAO' || (input.boyName && input.girlName)) {
      const boy = input.boyName || 'Niño';
      const girl = input.girlName || 'Niña';
      title = `Revelación de Género: ¿${boy} o ${girl}? (${input.parentsNames})`;
      message = `✨🍼 *INVITACIÓN: REVELACIÓN DE GÉNERO* 🍼✨

¡Hola, familia y amigos! ¡Preparamos con muchísimo cariño la página oficial de nuestra *Revelación de Género*! 🤍

¿Será *${boy}* 💙 o *${girl}* 💖?

En nuestra página especial puedes:
🎯 *Dar tu voto en la Porra* (¿Niño o Niña?)
🎁 *Elegir pañales y regalos* para bendecir a nuestro bebé
💌 *Dejar un hermoso mensaje* en nuestro muro de recuerdos

Toca el enlace de abajo para dejar tu voto y ver todo:
👇👇👇
${url}

Con mucho cariño,
*${input.parentsNames}* 🥰`;
    } else if (input.babyName || input.boyName || input.girlName) {
      const name = input.babyName || input.boyName || input.girlName || '';
      title = `Baby Shower de ${name} (${input.parentsNames})`;
      message = `🍼👶 *INVITACIÓN: BABY SHOWER DE ${name.toUpperCase()}* ✨🤍

¡Hola, querida familia y amigos! ¡Creamos con mucho amor la página oficial del Baby Shower de *${name}*! 🍼

Todo fue preparado con cariño para sentirnos cerca de quienes amamos:
🎁 *Lista de pañales y regalos* (práctico y seguro)
💌 *Muro de cariño* para dejar tus mensajes y buenos deseos
🧸 *Celebrar juntos* la espera más especial de nuestra vida

Toca el enlace de abajo para ver la página y dejar tu mensaje:
👇👇👇
${url}

Con mucho amor,
*${input.parentsNames}* 🥰`;
    } else {
      title = `Baby Shower de ${input.parentsNames}`;
      message = `🍼✨ *INVITACIÓN ESPECIAL: NUESTRO BABY SHOWER* ✨🤍

¡Hola, querida familia y amigos! ¡Preparamos con todo el amor del mundo la página oficial de nuestro Baby Shower! 🍼

Creamos un rincón especial para que seas parte de este momento:
🎁 *Lista de pañales y regalos* (práctico y seguro)
💌 *Muro de cariño* para dejar tu mensaje a nuestra familia
🧸 *Celebrar juntos* la llegada de nuestro mayor regalo

Toca el enlace de abajo para entrar y participar:
👇👇👇
${url}

Con mucho cariño,
*${input.parentsNames}* 🥰`;
    }
  } else {
    title = `Chá de Bebê de ${input.parentsNames}`;

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
    } else if (input.revealedGender === 'GIRL') {
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
    } else if (input.eventType === 'REVELACAO' || (input.boyName && input.girlName)) {
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
    } else if (input.babyName || input.boyName || input.girlName) {
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
    } else {
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
  }

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  return { title, message, url, whatsappUrl };
}

export async function shareEvent(
  input: ShareDataInput
): Promise<'SHARED' | 'COPIED' | 'CANCELLED'> {
  const { title, message } = buildSharePayload(input);

  if (typeof window !== 'undefined') {
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

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      return 'COPIED';
    }
  }

  return 'COPIED';
}

export function buildThankYouWhatsAppUrl(params: {
  phone: string | null | undefined;
  guestName: string;
  giftTitle?: string | null;
  parentsNames: string;
  locale?: Locale;
}): string | null {
  const digits = String(params.phone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;

  const fullPhone =
    digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;

  const locale: Locale = params.locale || 'pt';
  const firstName = (params.guestName || '').trim().split(/\s+/)[0];
  const hasRealFirstName =
    Boolean(firstName) &&
    !['convidado', 'guest', 'invitado'].includes(firstName.toLowerCase());

  let text = '';
  if (locale === 'en') {
    const greeting = hasRealFirstName ? `Hi ${firstName}!` : 'Hello!';
    const giftPart =
      params.giftTitle && params.giftTitle.trim()
        ? ` for your gift (${params.giftTitle.trim()})`
        : ' for your gift';
    text = `${greeting} Thank you so much${giftPart} and for all the love toward our baby! 🤍\n\nWith love,\n${params.parentsNames}`;
  } else if (locale === 'es') {
    const greeting = hasRealFirstName ? `¡Hola, ${firstName}!` : '¡Hola!';
    const giftPart =
      params.giftTitle && params.giftTitle.trim()
        ? ` por tu regalo (${params.giftTitle.trim()})`
        : ' por tu regalo';
    text = `${greeting} ¡Muchas gracias${giftPart} y por tanto cariño hacia nuestro bebé! 🤍\n\nCon cariño,\n${params.parentsNames}`;
  } else {
    const greeting = hasRealFirstName ? `Oi, ${firstName}!` : 'Olá!';
    const giftPart =
      params.giftTitle && params.giftTitle.trim()
        ? ` pelo presente (${params.giftTitle.trim()})`
        : ' pelo presente';
    text = `${greeting} Muito obrigado(a)${giftPart} e pelo carinho com o nosso bebê! 🤍\n\nCom carinho,\n${params.parentsNames}`;
  }

  return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`;
}
