import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from "./providers"
import CookieBanner from '@/components/CookieBanner'
import SplashOnFirstVisit from '@/components/SplashOnFirstVisit'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Catalogue Scientifique - Union des Comores',
  description: 'Découvrez la richesse scientifique et biologique de l\'Union des Comores avec notre catalogue scientifique complet.',
  keywords: ['Comores', 'catalogue', 'scientifique', 'biodiversité', 'sciences'],
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="bg-white">
      <body className={_geist.className + ' font-sans antialiased'}>
         <Providers>
            <SplashOnFirstVisit
            duration={10_000}
            label="Bienvenue sur le Catalogue Scientifique des Comores…"
          />
          {children}
        </Providers>
         <CookieBanner />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
