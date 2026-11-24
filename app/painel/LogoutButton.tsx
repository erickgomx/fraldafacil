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
      onClick={handleLogout}
      title={dict.signOutTitle}
      aria-label={dict.signOutAria}
      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
