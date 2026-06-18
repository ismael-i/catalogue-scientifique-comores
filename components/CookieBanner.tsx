// app/components/CookieBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';

const COOKIE_NAME = 'cookie_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 jours

type ConsentValue = 'accepted' | 'rejected';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // N'affiche la bannière que si aucun choix n'a encore été enregistré
    const consent = getCookie(COOKIE_NAME);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function saveConsent(value: ConsentValue) {
    setCookie(COOKIE_NAME, value, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Bannière de gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-[9998] flex justify-center px-4 pb-4 sm:px-6"
    >
      <div className="flex w-full max-w-3xl flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            CS
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Nous utilisons des cookies pour améliorer votre expérience sur le
            Catalogue Scientifique des Comores et analyser l’audience du
            site. Vous pouvez accepter ou refuser leur utilisation.{' '}
            <a
              href="/confidentialite"
              className="font-medium text-blue-600 hover:underline"
            >
              En savoir plus
            </a>
          </p>
        </div>

        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => saveConsent('rejected')}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-600 sm:flex-none"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => saveConsent('accepted')}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:flex-none"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
