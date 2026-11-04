'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BrandLoaderProps {
  fullScreen?: boolean;
  className?: string;
  minDurationMs?: number; // Padrão 500ms para evitar estranhamento/flicker
  visible?: boolean;
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
          className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-cream-300/40 blur-xl pointer-events-none"
        />

        {/* Emblema Oficial Fralda Online: Chupeta com Globo da Internet */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white border border-[#E7E2DA] shadow-card flex items-center justify-center p-3 sm:p-3.5">
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id="brand-loader-globe-clip">
                <circle cx="0" cy="95" r="75" />
              </clipPath>
            </defs>

            <g transform="translate(250, 250) rotate(45)">
              {/* 1. Bico da Chupeta */}
              <path
                d="M -30,-45 C -45,-80 -55,-130 0,-155 C 55,-130 45,-80 30,-45 Z"
                fill="#FFFFFF"
                stroke="#111111"
                strokeWidth="16"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Brilho no bico */}
              <path
                d="M -12,-140 C -26,-125 -28,-105 -24,-90"
                fill="none"
                stroke="#111111"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* 2. Base Protetora Labial */}
              <rect
                x="-95"
                y="-45"
                width="190"
                height="46"
                rx="23"
                fill="#D1D5DB"
                stroke="#111111"
                strokeWidth="16"
                strokeLinejoin="round"
              />

              {/* 3. Conector */}
              <rect
                x="-24"
                y="0"
                width="48"
                height="28"
                rx="6"
                fill="#6B7280"
                stroke="#111111"
                strokeWidth="14"
                strokeLinejoin="round"
              />

              {/* 4. Argola / Globo da Internet */}
              <circle cx="0" cy="95" r="85" fill="none" stroke="#111111" strokeWidth="14" />
              <circle cx="0" cy="95" r="75" fill="#FFFFFF" stroke="#111111" strokeWidth="14" />

              <g clipPath="url(#brand-loader-globe-clip)" stroke="#111111" strokeWidth="10" fill="none">
                <line x1="0" y1="20" x2="0" y2="170" />
                <line x1="-75" y1="95" x2="75" y2="95" />
                <line x1="-65" y1="65" x2="65" y2="65" />
                <line x1="-65" y1="125" x2="65" y2="125" />
                <ellipse cx="0" cy="95" rx="42" ry="75" />
              </g>

              <path
                d="M -68,148 A 86 86 0 0 0 25,180"
                fill="none"
                stroke="#111111"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!isControlled) {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50/95 backdrop-blur-sm">
          {loaderBody}
        </div>
      );
    }
    return loaderBody;
  }

  return (
    <AnimatePresence>
      {shouldRender && (
        fullScreen ? (
          <motion.div
            key="brand-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.24 } }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50/95 backdrop-blur-sm"
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
