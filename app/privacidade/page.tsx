import type { Metadata } from 'next';
import PrivacidadeClient from './PrivacidadeClient';

export const metadata: Metadata = {
  title: 'Política de Privacidade e Proteção de Dados (LGPD) — Fralda Online',
  description: 'Conheça nosso compromisso com a privacidade, transparência e segurança de dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018).',
};

export default function PrivacyPage() {
  return <PrivacidadeClient />;
}
