'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/LanguageProvider';
import { commonDict } from '@/lib/i18n/dictionaries/common';

export default function LogoutButton() {
  const router = useRouter();
  const { locale } = useI18n();
  const dict = commonDict[locale].logout;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      title={dict.signOutTitle}
      aria-label={dict.signOutAria}
      className="w-8 h-8 rounded-lg border border-warm-border/80 bg-white/80 hover:bg-dusty-rose-light hover:text-dusty-rose hover:border-dusty-rose/30 text-charcoal-600 shrink-0 flex items-center justify-center transition cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
