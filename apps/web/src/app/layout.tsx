import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export const metadata: Metadata = {
  title: 'FlashKit — Instant Transaction UX on GIWA',
  description: 'Developer toolkit for GIWA Flashblocks preconfirmations, lifecycle orchestration, simulation, and benchmark telemetry.'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-zinc-100 selection:bg-yellow-400 selection:text-black">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
