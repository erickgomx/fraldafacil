import React from 'react';

interface MercadoPagoLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Logotipo oficial do Mercado Pago conforme identidade visual fornecida.
 * Exibe o emblema e a tipografia oficial com proporção nítida e adaptada.
 */
export default function MercadoPagoLogo({
  className = '',
  size = 'md',
}: MercadoPagoLogoProps) {
  const sizeMap = {
    xs: 'h-3.5 w-auto',
    sm: 'h-4.5 w-auto',
    md: 'h-6 w-auto',
    lg: 'h-7 w-auto',
  }[size];

  return (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      {/* Container com fundo suave quando necessário para manter legibilidade impecável */}
      <img
        src="/mercado-pago.png"
        alt="Mercado Pago"
        className={`${sizeMap} object-contain select-none`}
        loading="lazy"
        width={292}
        height={77}
      />
    </span>
  );
}
