'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-500 via-teal-500 to-teal-600 rounded-2xl py-12 px-6 md:px-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Vous êtes chercheur aux Comores ?
          </h2>
          <p className="text-white text-base mb-8 opacity-95">
            Rejoignez le catalogue scientifique national et donnez de la visibilité à
            <br />
            vos travaux de recherche.
          </p>
          <Button className="bg-white hover:bg-gray-50 text-teal-600 px-8 py-3 h-auto rounded font-semibold flex items-center gap-2 mx-auto">
            Créer un compte
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  )
}
