import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { HydrationFix } from '@/components/HydrationFix'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zoom Video Player',
  description: 'Professional video meetings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">  {/* ← Removed className="scroll-smooth" */}
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <HydrationFix />
        {children}
      </body>
    </html>
  )
}