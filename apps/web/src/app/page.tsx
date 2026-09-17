import React from 'react'
import Link from 'next/link'
import {
  Zap,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Gauge
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 flex flex-col items-center text-center">
        {/* Network & Status pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span>GIWA Flashblocks Layer</span>
          <span className="text-zinc-600">/</span>
          <span className="text-yellow-400 font-semibold">Chain ID 91342</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-4xl text-white">
          Build <span className="text-yellow-400">instant</span> onchain experiences on GIWA.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Preconfirmation, simulation and transaction lifecycle tooling powered by GIWA Flashblocks. Turn ~200ms preconfirmations into responsive application UX.
        </p>

        {/* Live Telemetry Bar */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono">
          <div className="flex flex-col items-center sm:items-start p-3 rounded-lg bg-black/40 border border-zinc-800/60">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">⚡ Preconfirmation</span>
            <span className="text-2xl font-bold text-yellow-400 mt-1">~187 ms</span>
            <span className="text-[11px] text-zinc-500 mt-0.5">Flashblocks RPC</span>
          </div>

          <div className="flex flex-col items-center sm:items-start p-3 rounded-lg bg-black/40 border border-zinc-800/60">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">📦 Canonical Inclusion</span>
            <span className="text-2xl font-bold text-zinc-200 mt-1">~986 ms</span>
            <span className="text-[11px] text-zinc-500 mt-0.5">GIWA 1s Block</span>
          </div>

          <div className="flex flex-col items-center sm:items-start p-3 rounded-lg bg-black/40 border border-zinc-800/60">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">🚀 Early Advantage</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1">+799 ms</span>
            <span className="text-[11px] text-zinc-500 mt-0.5">Faster UI Feedback</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/playground"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-semibold font-mono text-sm transition shadow-lg shadow-yellow-400/20"
          >
            <Layers className="w-4 h-4" />
            Open Playground
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/inspector"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-mono text-sm transition"
          >
            <Terminal className="w-4 h-4" />
            Launch Inspector
          </Link>

          <Link
            href="/benchmark"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-mono text-sm transition"
          >
            <Activity className="w-4 h-4" />
            View Benchmark
          </Link>
        </div>
      </section>

      {/* Architectural Value Pillars */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-zinc-800/80">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-yellow-400">Core Architecture</h2>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
            One SDK. Two RPC States. Complete Transaction Lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Flashblocks Preconfirmation</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Queries GIWA Flashblocks-aware RPC to detect transaction state in ~200ms before standard 1-second block sealing.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Canonical Finality Model</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Never confuses preconfirmation with finality. Tracks full OP Stack lifecycle: Submitted → Preconfirmed → Included → Safe → Finalized.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Graceful Degradation</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              If Flashblocks RPC is rate-limited or offline, FlashKit seamlessly falls back to canonical RPC. Transactions never break.
            </p>
          </div>
        </div>
      </section>

      {/* Code Quickstart */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-zinc-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center font-mono">
          <div>
            <span className="text-xs uppercase tracking-widest text-yellow-400">Developer Quickstart</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Add Flashblocks in under 10 lines of code.
            </h2>
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              Keep your existing wallet stack. When the transaction is sent, pass the hash to FlashKit. It takes care of dual-RPC tracking, preconfirmation events, and finality orchestration.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">✓</span>
                <span>Zero wallet custody or private key exposure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">✓</span>
                <span>Works with viem, wagmi, MetaMask, ConnectKit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">✓</span>
                <span>TypeScript typed lifecycle events</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-black border border-zinc-800 text-xs overflow-x-auto shadow-2xl">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-900 text-zinc-500">
              <span className="w-3 h-3 rounded-full bg-zinc-800" />
              <span className="w-3 h-3 rounded-full bg-zinc-800" />
              <span className="w-3 h-3 rounded-full bg-zinc-800" />
              <span className="ml-2 font-mono text-[11px]">quickstart.ts</span>
            </div>
            <pre className="text-zinc-300 leading-loose">
              <span className="text-zinc-500">// 1. Initialize FlashKit for GIWA Sepolia</span>{'\n'}
              <span className="text-purple-400">import</span> {'{ createFlashKit }'} <span className="text-purple-400">from</span> <span className="text-emerald-400">&apos;@flashkit/core&apos;</span>{'\n'}
              <span className="text-purple-400">const</span> flashkit = <span className="text-blue-400">createFlashKit</span>(){'\n\n'}
              <span className="text-zinc-500">// 2. Track any transaction hash</span>{'\n'}
              <span className="text-purple-400">const</span> tracker = flashkit.<span className="text-blue-400">trackTransaction</span>(hash){'\n\n'}
              tracker.<span className="text-blue-400">on</span>(<span className="text-emerald-400">&apos;preconfirmed&apos;</span>, ({'{ state }'}) =&gt; {'{'}{'\n'}
              {'  '}console.<span className="text-blue-400">log</span>(<span className="text-emerald-400">`⚡ Preconfirmed in ${'{'}state.timeline.preconfirmationMs{'}'}ms`</span>){'\n'}
              {'}'}){'\n\n'}
              tracker.<span className="text-blue-400">on</span>(<span className="text-emerald-400">&apos;included&apos;</span>, ({'{ state }'}) =&gt; {'{'}{'\n'}
              {'  '}console.<span className="text-blue-400">log</span>(<span className="text-emerald-400">`📦 Canonical Block #${'{'}state.blockNumber{'}'}`</span>){'\n'}
              {'}'})
            </pre>
          </div>
        </div>
      </section>
    </div>
  )
}
