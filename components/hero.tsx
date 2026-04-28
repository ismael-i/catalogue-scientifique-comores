'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="w-full bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Logos Section */}
        <div className="flex items-center justify-between gap-8 mb-16 pb-12 border-b border-gray-200">
          {/* Left - Organization Logos */}
          <div className="flex items-center gap-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <span className="text-gray-400 text-xs">Logo</span>
              </div>
            ))}
          </div>

          {/* Right - France Support */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900">Avec le soutien de</p>
              <p className="text-xs text-gray-700">l&apos;Ambassade de France</p>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400 text-xs">Logo</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-gray-800">Catalogue Scientifique</span>
            <br />
            <span className="text-blue-500">des Comores</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-2xl">
            Explorez le répertoire des chercheurs, laboratoires et publications scientifiques de l&apos;Union des Comores. Un outil au service de la recherche et de la collaboration académique.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 h-auto rounded flex items-center gap-2">
              Explorer les chercheurs
              <ArrowRight size={18} />
            </Button>
            <Button 
              variant="outline" 
              className="text-gray-700 hover:text-blue-500 border-gray-300 px-6 py-3 h-auto"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500 mb-2">45</p>
              <p className="text-sm text-gray-600">Chercheurs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500 mb-2">28</p>
              <p className="text-sm text-gray-600">Laboratoires</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500 mb-2">12</p>
              <p className="text-sm text-gray-600">Publications</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500 mb-2">5</p>
              <p className="text-sm text-gray-600">Institutions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
