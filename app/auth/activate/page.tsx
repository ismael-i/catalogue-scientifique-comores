// app/auth/activate/page.tsx
import { Suspense } from 'react';
import ActivateContent from './ActivateContent'; // déplace le composant ci-dessus dans un fichier séparé

export default function ActivatePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ActivateContent />
    </Suspense>
  );
}