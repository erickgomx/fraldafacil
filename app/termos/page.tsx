import type { Metadata } from 'next';
import TermosClient from './TermosClient';

export const metadata: Metadata = {
  title: 'Termos de Uso e Condições Gerais — Fralda Online',
  description: 'Conheça os Termos de Uso e Condições Gerais da plataforma Fralda Online para organizadores e convidados.',
};

export default function TermsPage() {
  return <TermosClient />;
}
