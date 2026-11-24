import type { Locale } from '../types';

const pt = {
  brandTagline: 'Chá & Revelação',
  theme: {
    light: 'Claro',
    dark: 'Escuro',
    enableLight: 'Ativar modo claro',
    enableDark: 'Ativar modo escuro',
    switchToLight: 'Mudar para modo claro',
    switchToDark: 'Mudar para modo escuro',
  },
  languageSwitcher: {
    ariaLabel: 'Selecionar idioma da página',
    names: {
      pt: 'Português',
      en: 'English',
      es: 'Español',
    },
  },
  logout: {
    signOutTitle: 'Sair da Conta',
    signOutAria: 'Sair da conta',
  },
  notFound: {
    codeLabel: 'Erro 404',
    title: 'Não encontramos esta página de chá',
    description:
      'Confira se o endereço recebido no WhatsApp foi digitado corretamente ou peça o link atualizado aos pais.',
    goHome: 'Ir para a página inicial',
    viewDemo: 'Ver demonstração',
  },
  errorPage: {
    eyebrow: 'Ops, algo saiu do previsto',
    title: 'Não foi possível carregar esta página',
    description:
      'Ocorreu uma instabilidade temporária. Tente recarregar ou volte para a página inicial.',
    retry: 'Tentar novamente',
    goHome: 'Voltar ao início',
  },
  eventTypes: {
    REVELACAO: 'Chá Revelação',
    FRALDA: 'Chá de Fralda',
    AMBOS: 'Chá de Fralda & Revelação',
    short: {
      REVELACAO: 'Chá Revelação',
      FRALDA: 'Chá de Fralda',
      AMBOS: 'Ambos Juntos',
    },
  },
  paymentMethods: {
    PIX: 'Pix',
    CREDIT_CARD: 'Cartão de Crédito',
    CARD_SHORT: 'Cartão',
  },
  genders: {
    boy: 'Menino',
    girl: 'Menina',
  },
};

export type CommonDict = typeof pt;

const en: CommonDict = {
  brandTagline: 'Baby Shower & Reveal',
  theme: {
    light: 'Light',
    dark: 'Dark',
    enableLight: 'Enable light mode',
    enableDark: 'Enable dark mode',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
  },
  languageSwitcher: {
    ariaLabel: 'Select page language',
    names: {
      pt: 'Português',
      en: 'English',
      es: 'Español',
    },
  },
  logout: {
    signOutTitle: 'Sign Out',
    signOutAria: 'Sign out of account',
  },
  notFound: {
    codeLabel: 'Error 404',
    title: 'We could not find this baby shower page',
    description:
      'Please check if the link you received on WhatsApp was typed correctly or ask the parents for the updated link.',
    goHome: 'Go to homepage',
    viewDemo: 'View demo',
  },
  errorPage: {
    eyebrow: 'Oops, something unexpected happened',
    title: 'Unable to load this page',
    description:
      'A temporary issue occurred. Try reloading or return to the homepage.',
    retry: 'Try again',
    goHome: 'Back to home',
  },
  eventTypes: {
    REVELACAO: 'Gender Reveal',
    FRALDA: 'Diaper Baby Shower',
    AMBOS: 'Baby Shower & Reveal',
    short: {
      REVELACAO: 'Gender Reveal',
      FRALDA: 'Baby Shower',
      AMBOS: 'Both Combined',
    },
  },
  paymentMethods: {
    PIX: 'Pix',
    CREDIT_CARD: 'Credit Card',
    CARD_SHORT: 'Card',
  },
  genders: {
    boy: 'Boy',
    girl: 'Girl',
  },
};

const es: CommonDict = {
  brandTagline: 'Baby Shower y Revelación',
  theme: {
    light: 'Claro',
    dark: 'Oscuro',
    enableLight: 'Activar modo claro',
    enableDark: 'Activar modo oscuro',
    switchToLight: 'Cambiar a modo claro',
    switchToDark: 'Cambiar a modo oscuro',
  },
  languageSwitcher: {
    ariaLabel: 'Seleccionar idioma de la página',
    names: {
      pt: 'Português',
      en: 'English',
      es: 'Español',
    },
  },
  logout: {
    signOutTitle: 'Cerrar Sesión',
    signOutAria: 'Cerrar sesión de la cuenta',
  },
  notFound: {
    codeLabel: 'Error 404',
    title: 'No encontramos esta página de baby shower',
    description:
      'Verifica si el enlace recibido por WhatsApp fue escrito correctamente o pide el enlace actualizado a los padres.',
    goHome: 'Ir a la página principal',
    viewDemo: 'Ver demostración',
  },
  errorPage: {
    eyebrow: 'Ups, algo salió de lo previsto',
    title: 'No se pudo cargar esta página',
    description:
      'Ocurrió una inestabilidad temporal. Intenta recargar o vuelve a la página principal.',
    retry: 'Intentar de nuevo',
    goHome: 'Volver al inicio',
  },
  eventTypes: {
    REVELACAO: 'Revelación de Género',
    FRALDA: 'Baby Shower de Pañales',
    AMBOS: 'Baby Shower y Revelación',
    short: {
      REVELACAO: 'Revelación',
      FRALDA: 'Baby Shower',
      AMBOS: 'Ambos Juntos',
    },
  },
  paymentMethods: {
    PIX: 'Pix',
    CREDIT_CARD: 'Tarjeta de Crédito',
    CARD_SHORT: 'Tarjeta',
  },
  genders: {
    boy: 'Niño',
    girl: 'Niña',
  },
};

export const commonDict: Record<Locale, CommonDict> = { pt, en, es };
