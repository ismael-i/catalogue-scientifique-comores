// app/auth/activate/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("Lien d'activation invalide : token manquant.");
      return;
    }

    const activate = async () => {
      try {
        const data = await authApi.activate(token);
        setStatus('success');
        setMessage(data.message || 'Votre compte a été activé avec succès !');
        setTimeout(() => router.push('/auth/login'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(
          err instanceof ApiError ? err.message : "Erreur lors de l'activation. Veuillez réessayer."
        );
      }
    };

    activate();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Activation en cours...</h2>
            <p className="text-gray-500 mt-2">Veuillez patienter.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Compte activé !</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirection vers la connexion...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Erreur d'activation</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={() => router.push('/contact')}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Contacter le support
            </button>
          </>
        )}
      </div>
    </div>
  );
}