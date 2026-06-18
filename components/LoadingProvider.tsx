'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Loading from '@/components/ui/Loading';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simule le temps de chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMounted(true);
    }, 3000); // Affiche le loading pendant 3 secondes

    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && mounted === false && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-white">
          <Loading />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
