import React from 'react'

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-[#09090b] py-8 font-mono text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-zinc-300 font-semibold">FlashKit for GIWA</span>
          <span>—</span>
          <span>Open-source developer transaction experience toolkit</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://sepolia-explorer.giwa.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition"
          >
            GIWA Blockscout ↗
          </a>
          <a
            href="https://docs.giwa.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition"
          >
            Official Docs ↗
          </a>
          <span>Network: GIWA Sepolia (91342)</span>
        </div>
      </div>
    </footer>
  )
}
