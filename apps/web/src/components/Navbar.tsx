'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Terminal, Activity, BookOpen, Layers, Droplet } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()

  const navLinks = [
    { href: '/inspector', label: 'Inspector', icon: Terminal },
    { href: '/playground', label: 'Playground', icon: Layers },
    { href: '/benchmark', label: 'Benchmark', icon: Activity },
    { href: '/docs', label: 'Docs', icon: BookOpen },
    { href: '/faucets', label: 'Faucets', icon: Droplet }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[#09090b]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-mono font-bold text-lg text-white hover:opacity-90 transition">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-black shadow-lg shadow-yellow-400/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="tracking-tight">FLASH<span className="text-yellow-400">KIT</span></span>
          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono font-normal">GIWA</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                  isActive
                    ? 'bg-zinc-800 text-yellow-400 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Live Network Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GIWA Sepolia</span>
            <span className="text-zinc-500">|</span>
            <span className="text-yellow-400 font-semibold">⚡ 200ms Preconf</span>
          </div>

          <a
            href="https://github.com/giwa-io"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs transition"
          >
            GIWA Ecosystem ↗
          </a>
        </div>
      </div>
    </header>
  )
}
