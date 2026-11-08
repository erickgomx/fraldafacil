/**
 * ============================================================================
 * INDICADOR DE CARREGAMENTO OFICIAL (BrandLoader)
 * ============================================================================
 * Exibe a animação carinhosa de respiração e brilho do logo do Fralda Online.
 *
 * Características de UX:
 * - Duração mínima de exibição (`minDurationMs = 500ms`): evita o incômodo efeito de
 *   "flicker" ou piscada na tela quando uma requisição termina em poucos milissegundos.
 * - Suporta tanto modo tela cheia com overlay (`fullScreen = true`) quanto embutido inline.
 * - Modo controlado (via prop `visible`) ou descontrolado (para ser usado dentro de `loading.tsx`).
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Propriedades do componente BrandLoader
export interface BrandLoaderProps {
  fullScreen?: boolean; // Se deve cobrir a tela inteira com backdrop blur
  className?: string; // Classes CSS adicionais
  minDurationMs?: number; // Tempo mínimo de permanência para evitar flicker visual (padrão 500ms)
  visible?: boolean; // Controle explícito de visibilidade booleana
}

export default function BrandLoader({
  fullScreen = true,
  className = '',
  minDurationMs = 500,
  visible,
}: BrandLoaderProps) {
  // Se 'visible' não for fornecido, opera como uncontrolled (ex: em loading.tsx)
  const isControlled = typeof visible === 'boolean';
  const [shouldRender, setShouldRender] = useState(isControlled ? visible : true);
  const mountTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Efeito que garante o tempo mínimo de permanência visual na tela
  useEffect(() => {
    if (!isControlled) return;

    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);
      mountTimeRef.current = Date.now();
      setShouldRender(true);
    } else {
      const elapsed = Date.now() - mountTimeRef.current;
      const remaining = Math.max(0, minDurationMs - elapsed);

      if (remaining > 0) {
        timerRef.current = setTimeout(() => {
          setShouldRender(false);
        }, remaining);
      } else {
        setShouldRender(false);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, minDurationMs, isControlled]);

  // Conteúdo visual animado com framer-motion (pulsação suave e halo de luz dourada)
  const loaderBody = (
    <motion.div
      key="brand-loader-content"
      initial={{ opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.24, ease: 'easeInOut' } }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex items-center justify-center"
      >
        {/* Halo de luz quente suave de fundo */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.55, 0.25],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-cream-300/40 dark:bg-stone-700/30 blur-xl pointer-events-none"
        />

        {/* Emblema Oficial Fralda Online: Modo Claro & Escuro (sem caixa quadrada de fundo) */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border-0 !outline-none">
          <Image
            src="/logo-light.png"
            alt="Fralda Online"
            width={160}
            height={160}
            className="w-full h-full object-contain dark:hidden no-outline !outline-none !border-none"
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            priority
          />
          <Image
            src="/logo-dark.png"
            alt="Fralda Online"
            width={160}
            height={160}
            className="w-full h-full object-contain hidden dark:block no-outline !outline-none !border-none"
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            priority
          />
        </div>
      </motion.div>
    </motion.div>
  );

  // Renderização descontrolada (loading.tsx)
  if (!isControlled) {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50/95 dark:bg-[#12100E]/95 backdrop-blur-sm">
          {loaderBody}
        </div>
      );
    }
    return loaderBody;
  }

  // Renderização controlada com transição de entrada e saída (fade in / fade out)
  return (
    <AnimatePresence>
      {shouldRender && (
        fullScreen ? (
          <motion.div
            key="brand-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.24 } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50/95 dark:bg-[#12100E]/95 backdrop-blur-sm"
          >
            {loaderBody}
          </motion.div>
        ) : (
          loaderBody
        )
      )}
    </AnimatePresence>
  );
}
