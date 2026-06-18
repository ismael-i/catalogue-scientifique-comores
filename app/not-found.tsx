// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-8">
      <div className="flex w-full max-w-[480px] flex-col items-center text-center">
        {/* Logo CS, identique au header du site */}
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-blue-600 text-sm font-bold text-white">
            CS
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[0.95rem] font-semibold text-slate-900">
              Catalogue Scientifique
            </span>
            <span className="text-xs text-slate-400">Union des Comores</span>
          </div>
        </div>

        {/* Illustration : fiche + loupe */}
        <div className="mb-6">
          <svg
            viewBox="0 0 220 180"
            className="h-[148px] w-[180px] sm:h-[180px] sm:w-[220px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="40"
              y="20"
              width="100"
              height="130"
              rx="8"
              stroke="#cbd5e1"
              strokeWidth="2"
              fill="#ffffff"
            />
            <line x1="58" y1="48" x2="122" y2="48" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
            <line x1="58" y1="64" x2="122" y2="64" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
            <line x1="58" y1="80" x2="105" y2="80" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
            <circle cx="68" cy="104" r="3" fill="#93c5fd" />
            <line x1="78" y1="104" x2="115" y2="104" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
            <circle cx="68" cy="120" r="3" fill="#93c5fd" />
            <line x1="78" y1="120" x2="115" y2="120" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />

            <g
              className="origin-[150px_108px] animate-floatGlass motion-reduce:animate-none"
            >
              <circle cx="150" cy="108" r="34" fill="rgba(37,99,235,0.06)" />
              <circle cx="150" cy="108" r="34" stroke="#2563eb" strokeWidth="5" fill="none" />
              <line x1="174" y1="132" x2="200" y2="158" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
              <text
                x="150"
                y="118"
                textAnchor="middle"
                fontFamily="inherit"
                fontWeight="700"
                fontSize="28"
                fill="#2563eb"
              >
                ?
              </text>
            </g>
          </svg>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal-600">
          Erreur 404
        </p>
        <h1 className="mb-3 text-2xl font-bold text-slate-900 sm:text-[1.75rem]">
          Page introuvable
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-500">
          La page que vous recherchez n’existe pas ou a été déplacée.
          Vérifiez l’URL ou retournez à l’accueil pour poursuivre votre
          recherche dans le catalogue.
        </p>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Retour à l’accueil
          </Link>
          <Link
            href="/chercheurs"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-600"
          >
            Explorer les chercheurs
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-slate-400">Liens utiles :</span>
          <Link href="/laboratoires" className="text-blue-600 hover:underline">
            Laboratoires
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/publications" className="text-blue-600 hover:underline">
            Publications
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/institutions" className="text-blue-600 hover:underline">
            Institutions
          </Link>
        </div>
      </div>
    </div>
  );
}
