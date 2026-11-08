import React from 'react';

interface MercadoPagoLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorVariant?: 'brand' | 'monochrome';
}

/**
 * Logotipo oficial minimalista do Mercado Pago.
 * Projetado para manter autoridade e conformidade institucional
 * sem destoar do design elegante e minimalista da plataforma.
 */
export default function MercadoPagoLogo({
  className = '',
  iconOnly = false,
  size = 'md',
  colorVariant = 'brand',
}: MercadoPagoLogoProps) {
  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const textSizes = {
    xs: 'text-[11px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const iconFill = colorVariant === 'brand' ? '#009EE3' : 'currentColor';

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-sans select-none tracking-tight ${className}`}
      aria-label="Mercado Pago"
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes} shrink-0`}
        fill={iconFill}
        aria-hidden="true"
      >
        <path d="M11.115 16.479a.93.927 0 0 1-.939-.886c-.002-.042-.006-.155-.103-.155-.04 0-.074.023-.113.059-.112.103-.254.206-.46.206a.816.814 0 0 1-.305-.066c-.535-.214-.542-.578-.521-.725.006-.038.007-.08-.02-.11l-.032-.03h-.034c-.027 0-.055.012-.093.039a.788.786 0 0 1-.454.16.7.699 0 0 1-.253-.05c-.708-.27-.65-.928-.617-1.126q.008-.062-.03-.092l-.05-.04-.047.043a.728.726 0 0 1-.505.203.73.728 0 0 1-.732-.725c0-.4.328-.722.732-.722.364 0 .675.27.721.63l.026.195.11-.165c.01-.018.307-.46.852-.46.102 0 .21.016.316.05.434.13.508.52.519.68.008.094.075.1.09.1.037 0 .064-.024.083-.045a.746.744 0 0 1 .54-.225q.193 0 .402.09c.69.293.379 1.158.374 1.167-.058.144-.061.207-.005.244l.027.013h.02c.03 0 .07-.014.134-.035.093-.032.235-.08.367-.08a.944.942 0 0 1 .94.93.936.934 0 0 1-.94.928m7.302-4.171c-1.138-.98-3.768-3.24-4.481-3.77-.406-.302-.685-.462-.928-.533a1.559 1.554 0 0 0-.456-.07q-.274 0-.58.095c-.46.145-.918.505-1.362.854l-.023.018c-.414.324-.84.66-1.164.73a1.986 1.98 0 0 1-.43.049c-.362 0-.687-.104-.81-.258q-.03-.037.04-.125l.008-.008 1-1.067c.783-.774 1.525-1.506 3.23-1.545h.085c1.062 0 2.12.469 2.24.524a7 7 0 0 0 3.056.724c1.076 0 2.188-.263 3.354-.795a9.135 9.11 0 0 0-.405-.317c-1.025.44-2.003.66-2.946.66-.962 0-1.925-.229-2.858-.68-.05-.022-1.22-.567-2.44-.57q-.049 0-.096.002c-1.434.033-2.24.536-2.782.976-.528.013-.982.138-1.388.25-.361.1-.673.186-.979.185-.125 0-.256-.013-.393-.04a2.9 2.9 0 0 1-.722-.249c-.427-.213-1.002-.565-1.94-.963q-.083-.036-.168-.066c-2.316-.788-5.32 1.344-5.342 1.358C2.551 10.368 1 12.01 1 14.397c0 1.94 1.336 4.385 4.542 5.568 2.052.756 4.417 1.135 6.787 1.135 2.502 0 5.006-.43 7.159-1.325 2.948-1.233 3.512-3.41 3.512-3.608 0-.044-.027-.376-.411-.794-.906-.991-3.134-2.87-4.484-3.996" />
      </svg>
      {!iconOnly && (
        <span className={`font-semibold ${textSizes} lowercase text-charcoal-900 dark:text-stone-100`}>
          mercado<span className="font-light text-charcoal-600 dark:text-stone-400">pago</span>
        </span>
      )}
    </div>
  );
}
