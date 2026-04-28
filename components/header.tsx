'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and title */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-900">Catalogue Scientifique</span>
              <span className="text-xs text-gray-500">Union des Comores</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link href="#" className="text-sm text-gray-700 hover:text-blue-500 transition">
              Accueil
            </Link>
            <Link href="#" className="text-sm text-gray-700 hover:text-blue-500 transition">
              Chercheurs
            </Link>
            <Link href="#" className="text-sm text-gray-700 hover:text-blue-500 transition">
              Laboratoires
            </Link>
            <Link href="#" className="text-sm text-gray-700 hover:text-blue-500 transition">
              Publications
            </Link>
            <Link href="#" className="text-sm text-gray-700 hover:text-blue-500 transition">
              Institutions
            </Link>
            <Link href="#" className="text-sm text-gray-700 hover:text-blue-500 transition">
              Fil info
            </Link>
            <Link href="#" className="text-sm text-gray-700 hover:text-blue-500 transition">
              À propos
            </Link>
          </nav>

          {/* CTA Button */}
          <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-6 py-2 h-auto rounded flex-shrink-0">
            Connexion
          </Button>
        </div>
      </div>
    </header>
  )
}
