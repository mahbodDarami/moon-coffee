import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import './globals.css'
import LenisProvider from './components/LenisProvider'
import LoadingScreen from './components/LoadingScreen'
import { AuthProvider } from './components/auth/AuthProvider'
import { MainLayout } from './components/MainLayout'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Moon Coffee — Since 2009',
  description: 'Specialty coffee. Sourced with care. Served with intention.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body>
        <AuthProvider>
          <LoadingScreen />
          <LenisProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </LenisProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
