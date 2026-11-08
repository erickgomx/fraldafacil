import React from 'react';
import Image from 'next/image';

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
  const dimensions = {
    xs: { width: 57, height: 15 },
    sm: { width: 76, height: 20 },
    md: { width: 95, height: 25 },
    lg: { width: 114, height: 30 },
  }[size];

  return (
    <span className={`inline-flex items-center shrink-0 border-0 !outline-none ${className}`}>
      <Image
        src="/mercado-pago.png"
        alt="Mercado Pago"
        width={dimensions.width}
        height={dimensions.height}
        className="w-auto h-auto object-contain select-none no-outline !outline-none !border-none"
        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
      />
    </span>
  );
}
