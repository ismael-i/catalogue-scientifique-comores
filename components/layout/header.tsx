'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { label: 'Accueil',      href: '/' },
  { label: 'Chercheurs',   href: '/chercheurs' },
  { label: 'Laboratoires', href: '/laboratoires' },
  { label: 'Publications', href: '/publications' },
  { label: 'Institutions', href: '/institutions' },
  { label: 'Fil info',     href: '/fil-info' },
  { label: 'À propos',     href: '/a-propos' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="w-full bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 ml-6"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div className="hidden md:flex flex flex-col">
              <span className="font-semibold text-sm text-gray-900">Catalogue Scientifique</span>
              <span className="text-xs text-gray-500">Union des Comores</span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-gray-700 hover:text-blue-500 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop : bouton Connexion */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 h-auto rounded flex items-center gap-2">
              <User className="w-4 h-4" />
              Connexion
            </Button>
          </div>

          {/* Mobile : bouton Connexion réduit + hamburger */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 h-auto rounded flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="text-xs">Connexion</span>
            </Button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Dropdown mobile */}
      {open && (
        <nav className="lg:hidden bg-white border-t border-gray-100 shadow-md flex flex-col">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="text-xs text-gray-700 hover:text-blue-500 hover:bg-blue-50 px-6 py-3.5 border-b border-gray-100 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}