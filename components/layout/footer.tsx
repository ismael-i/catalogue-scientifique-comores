'use client'

import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <h3 className="font-semibold text-white text-sm">Catalogue Scientifique</h3> */}
               <Image src="/logo_white.png" alt="Logo"  width={250} 
                              height={250} 
                              className="object-contain" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Plateforme de référencement des chercheurs, laboratoires et publications scientifiques de l&apos;Union des Comores. Un outil au service de la visibilité et de la collaboration académique.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Navigation</h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Chercheurs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Laboratoires
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Institutions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Fil info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Informations</h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-gray-400 hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="mailto:contact@catalogue-scientifique.km" className="text-gray-400 hover:text-white transition-colors">
                  contact@catalogue-scientifique.km
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Moroni, Union des Comores</span>
              </li>
              <li>
                {/* Soutien Ambassade de France */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs font-semibold text-white leading-tight">Avec le soutien de</p>
              <p className="text-xs text-white">l&apos;Ambassade de France</p>
            </div>
            <div className="w-30 h-30 sm:w-30 sm:h-30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Amb-Union-des-Comores white.png"
                alt="Ambassade de France"
                className="w-full h-full object-contain p-1"
              />
            </div>
          </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            &copy; {currentYear} Catalogue Scientifique des Comores. Tous droits réservés.
          </p>
          <p>
            Moroni — Union des Comores
          </p>
        </div>
      </div>
    </footer>
  )
}
