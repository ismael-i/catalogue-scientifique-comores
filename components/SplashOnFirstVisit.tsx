// app/components/SplashOnFirstVisit.tsx
'use client';

import { useEffect } from 'react';
import { useLoading } from './LoadingProvider';

const SESSION_KEY = 'cs_splash_shown';

type SplashOnFirstVisitProps = {
  /** Durée d'affichage en ms avant disparition automatique. Défaut: 10000 (10s) */
  duration?: number;
  /** Texte affiché pendant le splash */
  label?: string;
};

/**
 * Affiche le loader global lors de l'arrivée sur le site, puis le cache
 * automatiquement après `duration` ms. Ne se réaffiche PAS lors d'une
 * navigation interne (changement de page côté client) grâce à un flag
 * en sessionStorage.
 *
 * Le splash réapparaît si :
 * - l'onglet est fermé puis le site rouvert
 * - le site est ouvert dans un nouvel onglet/fenêtre
 * - la session de navigation est terminée
 *
 * Il ne réapparaît PAS si on clique simplement entre les pages du site.
 *
 * Usage : place <SplashOnFirstVisit /> une seule fois, dans le layout
 * racine (app/layout.tsx), pas dans chaque page.
 */
export default function SplashOnFirstVisit({
  duration = 10_000,
  label = 'Bienvenue sur le Catalogue Scientifique…',
}: SplashOnFirstVisitProps) {
  const { show, hide } = useLoading();

  useEffect(() => {
    // sessionStorage n'existe que côté client ; on est dans useEffect donc c'est sûr
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown) return;

    sessionStorage.setItem(SESSION_KEY, '1');
    show({ label, timeout: null });

    const timer = setTimeout(hide, duration);

    return () => {
      clearTimeout(timer);
      hide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
