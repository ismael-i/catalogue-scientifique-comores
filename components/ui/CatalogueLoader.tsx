// app/providers/CatalogueLoader.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';

type CatalogueLoaderProps = {
  visible: boolean;
  label?: string;
  /** 0-100. Si undefined -> mode indéterminé (oscillation douce) */
  progress?: number;
};

export default function CatalogueLoader({
  visible,
  label,
  progress,
}: CatalogueLoaderProps) {
  const [autoLevel, setAutoLevel] = useState(35);

  useEffect(() => {
    if (progress !== undefined || !visible) return;
    let frame: number;
    const start = performance.now();
    const loop = (t: number) => {
      const elapsed = (t - start) / 1000;
      const level = 52 + Math.sin(elapsed * 1.1) * 22;
      setAutoLevel(level);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [progress, visible]);

  const fillLevel = useMemo(() => {
    const value = progress !== undefined ? progress : autoLevel;
    return Math.min(100, Math.max(0, value));
  }, [progress, autoLevel]);

  const ticks = useMemo(() => Array.from({ length: 7 }, (_, i) => i), []);

  const bubbles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: 20 + Math.random() * 60,
        size: 3 + Math.random() * 4,
        delay: Math.random() * 2.2,
        duration: 1.9 + Math.random() * 1.4,
      })),
    []
  );

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/90 backdrop-blur-sm animate-fadeIn motion-reduce:animate-none"
    >
      <div className="flex min-w-[280px] flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white px-11 py-9 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)]">
        {/* Logo CS, identique au header du site */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">
              Catalogue Scientifique
            </span>
            <span className="text-xs text-slate-400">Union des Comores</span>
          </div>
        </div>

        <div className="relative flex h-40 w-[100px] items-center justify-center">
          <svg
            viewBox="0 0 100 160"
            className="relative z-10 h-40 w-[100px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id="tubeClipLight">
                <path d="M34 8 H66 V112 C66 138 50 150 50 150 C50 150 34 138 34 112 Z" />
              </clipPath>
              <linearGradient id="liquidGradientLight" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Verre */}
            <path
              d="M34 8 H66 V112 C66 138 50 150 50 150 C50 150 34 138 34 112 Z"
              stroke="#cbd5e1"
              strokeWidth="2"
              fill="#f8fafc"
            />
            <rect
              x="29"
              y="2"
              width="42"
              height="9"
              rx="2.5"
              stroke="#cbd5e1"
              strokeWidth="2"
              fill="#f8fafc"
            />

            {/* Liquide */}
            <g clipPath="url(#tubeClipLight)">
              <rect
                x="26"
                y={160 - fillLevel * 1.45}
                width="48"
                height="160"
                fill="url(#liquidGradientLight)"
                className="transition-[y] duration-500 ease-in-out"
              />
              <path
                d="M26 0 Q38 -3 50 0 T74 0 V9 H26 Z"
                fill="#93C5FD"
                opacity="0.9"
                className="transition-transform duration-500 ease-in-out"
                style={{ transform: `translateY(${160 - fillLevel * 1.45}px)` }}
              />
            </g>

            {/* Graduations */}
            {ticks.map((i) => (
              <line
                key={i}
                x1="66"
                x2={i % 2 === 0 ? '58' : '62'}
                y1={22 + i * 14}
                y2={22 + i * 14}
                stroke="#cbd5e1"
                strokeWidth="1.3"
              />
            ))}
          </svg>

          {/* Bulles montantes */}
          <div
            className="absolute bottom-[13px] left-0 h-[62%] w-full overflow-hidden"
            style={{ clipPath: 'inset(0 30% 0 30% round 0 0 22px 22px)' }}
          >
            {bubbles.map((b) => (
              <span
                key={b.id}
                className="absolute bottom-0 rounded-full bg-white/95 shadow-[0_0_3px_rgba(37,99,235,0.35)] animate-rise opacity-0 motion-reduce:animate-none"
                style={{
                  left: `${b.left}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  animationDelay: `${b.delay}s`,
                  animationDuration: `${b.duration}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="min-h-[1.3em] text-sm font-medium text-slate-700">
            {label ?? 'Chargement en cours…'}
          </p>
          <div className="relative h-1.5 w-[170px] overflow-hidden rounded-full bg-slate-200">
            {progress !== undefined ? (
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${fillLevel}%` }}
              />
            ) : (
              <div className="h-full w-2/5 animate-indeterminate rounded-full bg-gradient-to-r from-blue-600 to-teal-500 motion-reduce:animate-none" />
            )}
          </div>
          {progress !== undefined && (
            <span className="text-xs font-semibold text-slate-500">
              {Math.round(fillLevel)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
