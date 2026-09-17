'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  Zap,
  Shield,
  Layers,
  Terminal,
  Copy,
  Check,
  Code,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Box
} from 'lucide-react'

type SectionId =
  | 'quickstart'
  | 'architecture'
  | 'core'
  | 'react'
  | 'ui'
  | 'testing'
  | 'contracts'
  | 'faq'

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('quickstart')
  const [pkgManager, setPkgManager] = useState<'pnpm' | 'npm' | 'yarn' | 'bun'>('pnpm')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const installCommands = {
    pnpm: 'pnpm add @flashkit/core @flashkit/react @flashkit/ui viem react react-dom',
    npm: 'npm install @flashkit/core @flashkit/react @flashkit/ui viem react react-dom',
    yarn: 'yarn add @flashkit/core @flashkit/react @flashkit/ui viem react react-dom',
    bun: 'bun add @flashkit/core @flashkit/react @flashkit/ui viem react react-dom'
  }

  const sections = [
    { id: 'quickstart', label: '1. Quickstart & Installation', icon: Terminal },
    { id: 'architecture', label: '2. Architecture & Dual-RPC', icon: Layers },
    { id: 'core', label: '3. @flashkit/core API', icon: Zap },
    { id: 'react', label: '4. @flashkit/react Hooks', icon: Code },
    { id: 'ui', label: '5. @flashkit/ui Components', icon: Sparkles },
    { id: 'testing', label: '6. @flashkit/testing Engine', icon: Cpu },
    { id: 'contracts', label: '7. Smart Contracts (Foundry)', icon: Box },
    { id: 'faq', label: '8. FAQ & Best Practices', icon: Shield }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 font-mono text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-10 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Developer Documentation Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          FlashKit for GIWA Documentation
        </h1>
        <p className="text-zinc-400 text-sm max-w-3xl">
          Everything required to integrate GIWA Flashblocks (~200ms preconfirmations), dual-client fallback,
          pre-flight simulation (<code className="text-yellow-400">eth_simulateV1</code>), and real-time transaction telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-zinc-500 uppercase px-3 py-1">Table of Contents</span>
            {sections.map((sec) => {
              const Icon = sec.icon
              const isActive = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as SectionId)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition text-left ${
                    isActive
                      ? 'bg-yellow-400/10 text-yellow-400 font-bold border border-yellow-400/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-12">
          {/* 1. QUICKSTART */}
          {activeSection === 'quickstart' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">1. Quickstart & Installation</h2>
                <p className="text-sm text-zinc-400">
                  FlashKit is published to NPM as modular, zero-dependency scoped packages. Choose your package manager below:
                </p>
              </div>

              {/* Package Manager Selector */}
              <div className="rounded-xl bg-black border border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/60 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    {(['pnpm', 'npm', 'yarn', 'bun'] as const).map((pm) => (
                      <button
                        key={pm}
                        onClick={() => setPkgManager(pm)}
                        className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition ${
                          pkgManager === pm
                            ? 'bg-yellow-400 text-black'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => copyToClipboard(installCommands[pkgManager], 'install')}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition"
                  >
                    {copiedKey === 'install' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 text-xs font-mono text-yellow-300 overflow-x-auto">
                  <code>{installCommands[pkgManager]}</code>
                </div>
              </div>

              {/* 30-Second Example */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">30-Second Example</h3>
                <div className="rounded-xl bg-black border border-zinc-800 p-4 text-xs overflow-x-auto relative">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `import { createFlashKit } from '@flashkit/core'\n\nconst flashkit = createFlashKit()\nconst tracker = flashkit.trackTransaction('0x...')\n\ntracker.on('preconfirmed', ({ state }) => {\n  console.log('⚡ Preconfirmed in', state.timeline.preconfirmationMs, 'ms')\n})\n\ntracker.on('included', ({ state }) => {\n  console.log('📦 Included in Canonical Block #' + state.blockNumber)\n})`,
                        'code-30s'
                      )
                    }
                    className="absolute top-3 right-3 text-zinc-500 hover:text-white transition"
                  >
                    {copiedKey === 'code-30s' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-zinc-300 leading-relaxed">
                    <span className="text-purple-400">import</span> {'{ createFlashKit }'} <span className="text-purple-400">from</span> <span className="text-emerald-400">&apos;@flashkit/core&apos;</span>{'\n\n'}
                    <span className="text-purple-400">const</span> flashkit = <span className="text-blue-400">createFlashKit</span>(){'\n'}
                    <span className="text-purple-400">const</span> tracker = flashkit.<span className="text-blue-400">trackTransaction</span>(<span className="text-emerald-400">&apos;0x...&apos;</span>){'\n\n'}
                    tracker.<span className="text-blue-400">on</span>(<span className="text-emerald-400">&apos;preconfirmed&apos;</span>, ({'{ state }'}) =&gt; {'{'}{'\n'}
                    {'  '}console.<span className="text-blue-400">log</span>(<span className="text-emerald-400">&apos;⚡ Preconfirmed in&apos;</span>, state.timeline.preconfirmationMs, <span className="text-emerald-400">&apos;ms&apos;</span>){'\n'}
                    {'}'}){'\n\n'}
                    tracker.<span className="text-blue-400">on</span>(<span className="text-emerald-400">&apos;included&apos;</span>, ({'{ state }'}) =&gt; {'{'}{'\n'}
                    {'  '}console.<span className="text-blue-400">log</span>(<span className="text-emerald-400">&apos;📦 Included in Canonical Block #&apos;</span> + state.blockNumber){'\n'}
                    {'}'})
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* 2. ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">2. Architecture & Dual-RPC Model</h2>
                <p className="text-sm text-zinc-400">
                  GIWA operates two distinct RPC interfaces with complementary properties:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
                    <Zap className="w-4 h-4" />
                    <span>Flashblocks RPC</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                    Provides pending preconfirmation snapshots (~200ms). Streams optimistic sequencer order guarantees.
                  </p>
                  <code className="text-[11px] text-zinc-300 bg-black/60 px-2 py-1 rounded border border-zinc-800 block truncate">
                    https://sepolia-rpc-flashblocks.giwa.io
                  </code>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                    <Shield className="w-4 h-4" />
                    <span>Canonical RPC</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                    Produces standard OP Stack blocks (~1s), executes batch proofs to Ethereum L1, and confirms final receipts.
                  </p>
                  <code className="text-[11px] text-zinc-300 bg-black/60 px-2 py-1 rounded border border-zinc-800 block truncate">
                    https://sepolia-rpc.giwa.io
                  </code>
                </div>
              </div>

              {/* Graceful Fallback Explanation */}
              <div className="p-5 rounded-xl bg-yellow-950/20 border border-yellow-800/40 text-xs text-yellow-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Cardinal Rule & Graceful Fallback</span>
                </div>
                <p>
                  1. <strong>Preconfirmation is not finality:</strong> Preconfirmation provides instantaneous UI feedback. Finality requires canonical inclusion and L1 settlement.
                </p>
                <p>
                  2. <strong>Zero-failure degradation:</strong> If the Flashblocks RPC receives HTTP 429, timeouts, or downtime, FlashKit automatically degrades to canonical polling without failing the user transaction.
                </p>
              </div>
            </section>
          )}

          {/* 3. CORE API */}
          {activeSection === 'core' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">3. @flashkit/core API Reference</h2>
                <p className="text-sm text-zinc-400">
                  Framework-agnostic TypeScript core engine for transactions, simulations, and telemetry.
                </p>
              </div>

              {/* Methods Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-black/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Function / Method</th>
                      <th className="py-3 px-4">Arguments</th>
                      <th className="py-3 px-4">Returns</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    <tr>
                      <td className="py-3 px-4 font-bold text-yellow-400">createFlashKit(options?)</td>
                      <td className="py-3 px-4"><code>FlashKitConfig</code></td>
                      <td className="py-3 px-4"><code>FlashKitInstance</code></td>
                      <td className="py-3 px-4">Initializes dual canonical + preconf Viem clients for GIWA.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-yellow-400">trackTransaction(hash)</td>
                      <td className="py-3 px-4"><code>Hex (0x...)</code></td>
                      <td className="py-3 px-4"><code>TransactionTracker</code></td>
                      <td className="py-3 px-4">Emits <code>preconfirmed</code>, <code>included</code>, <code>finalized</code> events.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-yellow-400">simulate(params)</td>
                      <td className="py-3 px-4"><code>SimulateParams</code></td>
                      <td className="py-3 px-4"><code>Promise&lt;FlashSimulationResult&gt;</code></td>
                      <td className="py-3 px-4">Calls <code>eth_simulateV1</code> against the latest pending Flashblock.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-yellow-400">checkEndpointsHealth()</td>
                      <td className="py-3 px-4"><code>canonical, flashClient</code></td>
                      <td className="py-3 px-4"><code>Promise&lt;RpcHealthStatus&gt;</code></td>
                      <td className="py-3 px-4">Measures latency and active online state of both GIWA endpoints.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 4. REACT HOOKS */}
          {activeSection === 'react' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">4. @flashkit/react Hooks</h2>
                <p className="text-sm text-zinc-400">
                  Declarative React hooks and state machine bindings for seamless UI integration.
                </p>
              </div>

              {/* useFlashTransaction */}
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-yellow-400">useFlashTransaction({'{ hash }'})</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Primary Hook</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Subscribes to the dual-state transaction lifecycle. Returns live state, preconfirmation duration, canonical inclusion duration, and time saved.
                </p>
                <div className="rounded-lg bg-black border border-zinc-800 p-3 text-xs overflow-x-auto">
                  <pre className="text-zinc-300">
                    <span className="text-purple-400">const</span> {'{ status, preconfirmationMs, inclusionMs, isPreconfirmed, state }'} = <span className="text-blue-400">useFlashTransaction</span>({'{'}{'\n'}
                    {'  '}hash: <span className="text-emerald-400">&apos;0x8a0217b8...&apos;</span>{'\n'}
                    {'}'})
                  </pre>
                </div>
              </div>

              {/* useFlashSimulation */}
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-yellow-400">useFlashSimulation(params)</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Pre-Flight</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Triggers <code>eth_simulateV1</code> execution before user sign prompts. Returns gas estimate, revert reason, and execution trace.
                </p>
              </div>

              {/* useFlashStatus */}
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-yellow-400">useFlashStatus()</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Telemetry</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Polls the health of GIWA RPC endpoints. Automatically notifies UI when running in degraded fallback mode.
                </p>
              </div>
            </section>
          )}

          {/* 5. UI COMPONENTS */}
          {activeSection === 'ui' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">5. @flashkit/ui Components Catalog</h2>
                <p className="text-sm text-zinc-400">
                  Prebuilt, accessible, styled components for transaction timelines and latency metrics.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-sm font-bold text-yellow-400 mb-1">&lt;TransactionTimeline state={'{state}'} /&gt;</h3>
                  <p className="text-xs text-zinc-400 mb-3">
                    Vertical lifecycle timeline showing: Submitted ➔ Preconfirmed (~200ms) ➔ Canonical Included (~1s) ➔ Safe ➔ Finalized.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-sm font-bold text-yellow-400 mb-1">&lt;FlashBadge type=&quot;preconfirmed&quot; latencyMs={'{187}'} /&gt;</h3>
                  <p className="text-xs text-zinc-400 mb-3">
                    Compact pill badge indicating preconfirmation state with subtle pulse animations.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-sm font-bold text-yellow-400 mb-1">&lt;FlashLatency preconfirmationMs={'{190}'} inclusionMs={'{980}'} /&gt;</h3>
                  <p className="text-xs text-zinc-400 mb-3">
                    Metric card highlighting the exact milliseconds saved by GIWA Flashblocks early signal.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 6. TESTING */}
          {activeSection === 'testing' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">6. @flashkit/testing Mock Engine</h2>
                <p className="text-sm text-zinc-400">
                  Deterministic testing harness and failure injection for GIWA applications without spending testnet gas.
                </p>
              </div>

              <div className="rounded-xl bg-black border border-zinc-800 p-4 text-xs overflow-x-auto">
                <pre className="text-zinc-300 leading-relaxed">
                  <span className="text-purple-400">import</span> {'{ MockGiwaRpcEngine, SAMPLE_HASHES }'} <span className="text-purple-400">from</span> <span className="text-emerald-400">&apos;@flashkit/testing&apos;</span>{'\n\n'}
                  <span className="text-purple-400">const</span> mockEngine = <span className="text-purple-400">new</span> <span className="text-blue-400">MockGiwaRpcEngine</span>({'{'}{'\n'}
                  {'  '}preconfDelayMs: <span className="text-yellow-400">150</span>,{'\n'}
                  {'  '}shouldFailWith429: <span className="text-yellow-400">false</span>,{'\n'}
                  {'  '}shouldRevert: <span className="text-yellow-400">false</span>{'\n'}
                  {'}'}){'\n\n'}
                  <span className="text-zinc-500">// Test 429 rate limit injection & fallback:</span>{'\n'}
                  mockEngine.<span className="text-blue-400">setOption</span>(<span className="text-emerald-400">&apos;shouldFailWith429&apos;</span>, <span className="text-purple-400">true</span>)
                </pre>
              </div>
            </section>
          )}

          {/* 7. SMART CONTRACTS */}
          {activeSection === 'contracts' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">7. Smart Contracts (Foundry)</h2>
                <p className="text-sm text-zinc-400">
                  Reference contracts configured and tested on GIWA Sepolia (Chain ID: <code>91342</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-sm font-bold text-yellow-400 mb-2">FlashCounter.sol</h3>
                  <p className="text-xs text-zinc-400 mb-3">
                    Lightweight state-incrementing contract designed for high-frequency preconfirmation latency benchmarks.
                  </p>
                  <code className="text-[11px] text-zinc-500">contracts/src/FlashCounter.sol</code>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-sm font-bold text-yellow-400 mb-2">FlashMint.sol</h3>
                  <p className="text-xs text-zinc-400 mb-3">
                    ERC721 demo pass mint contract with max supply protections, token URI metadata, and reentrancy guards.
                  </p>
                  <code className="text-[11px] text-zinc-500">contracts/src/FlashMint.sol</code>
                </div>
              </div>
            </section>
          )}

          {/* 8. FAQ */}
          {activeSection === 'faq' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">8. Frequently Asked Questions</h2>
                <p className="text-sm text-zinc-400">
                  Common questions on security, OP Stack mechanics, and preconfirmation integrity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-sm font-bold text-white mb-2">Is a preconfirmation guaranteed never to reorg?</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Preconfirmations are optimistic sequencer promises. While sequencer reorgs on OP Stack are exceptionally rare, they are theoretically possible before canonical block inclusion and L1 batch publication. High-value transactions should require <code>included</code> or <code>safe</code> before final settlement.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-sm font-bold text-white mb-2">Does FlashKit hold or manage private keys?</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    No. FlashKit operates strictly on transaction hashes (<code className="text-yellow-400">0x...</code>) and unsigned simulation payloads. All signing remains in the user&apos;s wallet (e.g. MetaMask, Rabby, Coinbase Wallet).
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-sm font-bold text-white mb-2">What happens if the Flashblocks RPC is down?</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    FlashKit automatically marks degraded mode and switches tracking directly to the canonical GIWA RPC. Transactions are never dropped or failed due to preconfirmation RPC instability.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

