// app/hooks/useCookieConsent.ts
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

const COOKIE_NAME = 'cookie_consent';

type ConsentValue = 'accepted' | 'rejected' | null;

/**
 * Lit le consentement cookies enregistré par <CookieBanner />.
 * Utile pour conditionner le chargement de scripts tiers
 * (Google Analytics, pixels, etc.) au consentement réel de l'utilisateur.
 *
 * Exemple :
 *   const consent = useCookieConsent();
 *   if (consent === 'accepted') { // charger GA }
 */
export function useCookieConsent(): ConsentValue {
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    const value = getCookie(COOKIE_NAME);
    if (value === 'accepted' || value === 'rejected') {
      setConsent(value);
    }
  }, []);

  return consent;
}
