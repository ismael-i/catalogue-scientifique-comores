// app/providers/LoadingProvider.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CatalogueLoader from './ui/CatalogueLoader';

type LoadingOptions = {
  /** Texte affiché sous l'éprouvette, ex: "Chargement des chercheurs..." */
  label?: string;
  /** Progression manuelle 0-100. Si absent, animation indéterminée. */
  progress?: number;
  /**
   * Délai en ms avant que le loader ne se cache automatiquement
   * (sécurité anti-blocage si un fetch ne répond jamais).
   * - undefined -> utilise le timeout par défaut du provider (20000ms)
   * - 0 ou null -> désactive le timeout pour cet appel précis
   */
  timeout?: number | null;
};

type LoadingContextValue = {
  show: (options?: LoadingOptions) => void;
  hide: () => void;
  update: (options: LoadingOptions) => void;
  wrap: <T>(promise: Promise<T>, options?: LoadingOptions) => Promise<T>;
  isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

const DEFAULT_TIMEOUT = 10_000; // 10 secondes

type LoadingProviderProps = {
  children: React.ReactNode;
  /**
   * Timeout par défaut (ms) appliqué à tous les show() qui ne précisent
   * pas leur propre `timeout`. Mettre 0 ou null pour désactiver
   * globalement le timeout automatique. Par défaut : 20000ms.
   */
  timeout?: number | null;
  /**
   * Appelé si le loader se ferme automatiquement à cause du timeout
   * (et non d'un hide() explicite). Utile pour afficher un toast
   * d'erreur ("le chargement a pris trop de temps, réessayez").
   */
  onTimeout?: () => void;
};

export function LoadingProvider({
  children,
  timeout = DEFAULT_TIMEOUT,
  onTimeout,
}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState<number | undefined>(undefined);

  // Compteur de références : plusieurs show()/hide() peuvent s'imbriquer
  // (ex: deux fetch en parallèle) sans que l'un cache le loader de l'autre.
  const refCount = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Nettoyage si le provider démonte pendant qu'un timer est actif
  useEffect(() => () => clearTimer(), [clearTimer]);

  const forceHide = useCallback(
    (fromTimeout: boolean) => {
      clearTimer();
      refCount.current = 0;
      setIsLoading(false);
      setLabel(undefined);
      setProgress(undefined);
      if (fromTimeout) onTimeout?.();
    },
    [clearTimer, onTimeout]
  );

  const armTimer = useCallback(
    (optionTimeout: number | null | undefined) => {
      clearTimer();
      const effective = optionTimeout === undefined ? timeout : optionTimeout;
      if (!effective || effective <= 0) return; // timeout désactivé
      timeoutRef.current = setTimeout(() => forceHide(true), effective);
    },
    [clearTimer, forceHide, timeout]
  );

  const show = useCallback(
    (options?: LoadingOptions) => {
      refCount.current += 1;
      setLabel(options?.label);
      setProgress(options?.progress);
      setIsLoading(true);
      armTimer(options?.timeout);
    },
    [armTimer]
  );

  const hide = useCallback(() => {
    refCount.current = Math.max(0, refCount.current - 1);
    if (refCount.current === 0) {
      clearTimer();
      setIsLoading(false);
      setLabel(undefined);
      setProgress(undefined);
    }
  }, [clearTimer]);

  const update = useCallback((options: LoadingOptions) => {
    if (options.label !== undefined) setLabel(options.label);
    if (options.progress !== undefined) setProgress(options.progress);
  }, []);

  const wrap = useCallback(
    async <T,>(promise: Promise<T>, options?: LoadingOptions): Promise<T> => {
      show(options);
      try {
        return await promise;
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  const value = useMemo(
    () => ({ show, hide, update, wrap, isLoading }),
    [show, hide, update, wrap, isLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <CatalogueLoader visible={isLoading} label={label} progress={progress} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading doit être utilisé à l’intérieur de <LoadingProvider>');
  }
  return ctx;
}