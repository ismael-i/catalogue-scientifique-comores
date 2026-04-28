import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-96 bg-gradient-to-b from-sky-50 to-white flex items-center justify-center py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 text-balance">
          Catalogue Scientifique
        </h1>
        <p className="text-lg sm:text-xl text-slate-700 mb-8 max-w-2xl mx-auto text-balance">
          Découvrez la richesse scientifique et biologique de l&apos;Union des Comores
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Explorer le catalogue
          </Button>
          <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            En savoir plus
          </Button>
        </div>
      </div>
    </section>
  )
}
