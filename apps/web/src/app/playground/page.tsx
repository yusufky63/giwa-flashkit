'use client'

import React, { useState } from 'react'
import {
  Layers,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity
} from 'lucide-react'
import { createFlashKit, type FlashSimulationResult } from '@flashkit/core'
import { FlashStatus, TransactionTimeline, FlashLatency } from '@flashkit/ui'

type TabType = 'counter' | 'simulation' | 'payment' | 'mint'

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<TabType>('counter')

  // Counter Demo State
  const [count, setCount] = useState(42)
  const [counterTxStatus, setCounterTxStatus] = useState<any>(null)
  const [counterLoading, setCounterLoading] = useState(false)

  // Simulation Demo State
  const [simTo, setSimTo] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')
  const [simValue, setSimValue] = useState('0.001')
  const [simResult, setSimResult] = useState<FlashSimulationResult | null>(null)
  const [simLoading, setSimLoading] = useState(false)

  // Payment Demo State
  const [paymentHash, setPaymentHash] = useState<string | null>(null)
  const [paymentState, setPaymentState] = useState<any>(null)

  // Mint Demo State
  const [mintState, setMintState] = useState<any>(null)
  const [mintedTokens, setMintedTokens] = useState<number[]>([1, 2, 3])

  const flashkit = React.useMemo(() => createFlashKit(), [])

  const handleFastForwardFinality = (type: 'counter' | 'payment' | 'mint') => {
    const now = Date.now()
    const updater = (prev: any) => {
      if (!prev) return prev
      return {
        ...prev,
        status: 'finalized',
        timeline: {
          ...prev.timeline,
          safeAt: now - 30000,
          finalizedAt: now
        }
      }
    }
    if (type === 'counter') setCounterTxStatus(updater)
    if (type === 'payment') setPaymentState(updater)
    if (type === 'mint') setMintState(updater)
  }

  // 1. Simulate Counter Increment with Real Flashblocks Latency Simulation
  const handleIncrement = async () => {
    setCounterLoading(true)
    const startTime = performance.now()

    // Create an optimistic state
    setCounterTxStatus({
      status: 'submitted',
      timeline: { submittedAt: startTime }
    })

    // Simulate Flashblocks preconfirmation (~180-210ms)
    setTimeout(() => {
      const preconfirmedAt = performance.now()
      setCount((prev) => prev + 1)
      setCounterTxStatus((prev: any) => ({
        ...prev,
        status: 'preconfirmed',
        timeline: {
          ...prev.timeline,
          preconfirmedAt,
          preconfirmationMs: Math.round(preconfirmedAt - startTime)
        }
      }))
    }, 190)

    // Simulate Canonical block inclusion (~950-1050ms)
    setTimeout(() => {
      const includedAt = performance.now()
      setCounterTxStatus((prev: any) => ({
        ...prev,
        status: 'included',
        blockNumber: 36325560n,
        timeline: {
          ...prev.timeline,
          includedAt,
          inclusionMs: Math.round(includedAt - startTime),
          timeSavedMs: Math.round(includedAt - startTime - 190)
        }
      }))
      setCounterLoading(false)
    }, 980)
  }

  // 2. Real eth_simulateV1 Call
  const handleSimulate = async (forceRevert = false) => {
    setSimLoading(true)
    setSimResult(null)
    try {
      if (forceRevert) {
        const result = await flashkit.simulate({
          account: '0x0000000000000000000000000000000000000001',
          to: '0x0000000000000000000000000000000000000000',
          data: '0xffffffff',
          value: 0n
        }).catch((err) => ({
          success: false,
          gasUsed: 21000n,
          returnData: '0x',
          revertReason: err instanceof Error ? err.message : 'Execution reverted',
          durationMs: 45
        }))
        setSimResult(result as any)
      } else {
        const parsedValue = BigInt(Math.max(0, Math.round((parseFloat(simValue) || 0.001) * 1e18)))
        const result = await flashkit.simulate({
          account: '0x0000000000000000000000000000000000000001',
          to: simTo as `0x${string}`,
          value: parsedValue
        })
        setSimResult(result)
      }
    } catch (err) {
      console.error('Simulation error:', err)
      setSimResult({
        success: false,
        gasUsed: 21000n,
        returnData: '0x',
        revertReason: err instanceof Error ? err.message : 'Execution reverted',
        durationMs: 40
      } as any)
    } finally {
      setSimLoading(false)
    }
  }

  // 3. Payment Demo Simulation
  const handleSendPayment = () => {
    const startTime = performance.now()
    setPaymentState({
      status: 'submitted',
      timeline: { submittedAt: startTime }
    })

    setTimeout(() => {
      const preconfirmedAt = performance.now()
      setPaymentState((prev: any) => ({
        ...prev,
        status: 'preconfirmed',
        timeline: {
          ...prev.timeline,
          preconfirmedAt,
          preconfirmationMs: Math.round(preconfirmedAt - startTime)
        }
      }))
    }, 185)

    setTimeout(() => {
      const includedAt = performance.now()
      setPaymentState((prev: any) => ({
        ...prev,
        status: 'included',
        blockNumber: 36325562n,
        timeline: {
          ...prev.timeline,
          includedAt,
          inclusionMs: Math.round(includedAt - startTime),
          timeSavedMs: Math.round(includedAt - startTime - 185)
        }
      }))
    }, 995)
  }

  // 4. Mint Demo Simulation
  const handleMint = () => {
    const startTime = performance.now()
    setMintState({
      status: 'submitted',
      timeline: { submittedAt: startTime }
    })

    setTimeout(() => {
      const preconfirmedAt = performance.now()
      setMintedTokens((prev) => [...prev, prev.length + 1])
      setMintState((prev: any) => ({
        ...prev,
        status: 'preconfirmed',
        timeline: {
          ...prev.timeline,
          preconfirmedAt,
          preconfirmationMs: Math.round(preconfirmedAt - startTime)
        }
      }))
    }, 195)

    setTimeout(() => {
      const includedAt = performance.now()
      setMintState((prev: any) => ({
        ...prev,
        status: 'included',
        blockNumber: 36325565n,
        timeline: {
          ...prev.timeline,
          includedAt,
          inclusionMs: Math.round(includedAt - startTime),
          timeSavedMs: Math.round(includedAt - startTime - 195)
        }
      }))
    }, 975)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 font-mono">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>FlashKit Playground</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Interactive Flashblocks Experience
        </h1>
        <p className="text-zinc-400 text-sm">
          Experience sub-250ms preconfirmations and simulation on GIWA Sepolia. Compare early transaction signals with standard block inclusion.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-8">
        {(['counter', 'simulation', 'payment', 'mint'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === tab
                ? 'bg-yellow-400 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. COUNTER TAB */}
      {activeTab === 'counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase text-zinc-500 font-bold">Smart Contract</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-yellow-400">FlashCounter.sol</span>
              </div>

              <div className="my-10 text-center">
                <span className="text-7xl font-bold text-white tracking-tighter">{count}</span>
                <p className="text-xs text-zinc-500 mt-2">Current State (Pending Flashblock)</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleIncrement}
                disabled={counterLoading}
                className="w-full py-3.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 transition"
              >
                <Plus className="w-4 h-4" />
                {counterLoading ? 'Incrementing...' : 'Increment Counter'}
              </button>
              <button
                onClick={() => {
                  setCount(42)
                  setCounterTxStatus(null)
                }}
                disabled={counterLoading}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition py-1 text-center"
              >
                Reset Counter State
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {counterTxStatus ? (
              <>
                <TransactionTimeline state={counterTxStatus} />
                <FlashLatency
                  preconfirmationMs={counterTxStatus.timeline?.preconfirmationMs}
                  inclusionMs={counterTxStatus.timeline?.inclusionMs}
                  timeSavedMs={counterTxStatus.timeline?.timeSavedMs}
                />
                {counterTxStatus.status === 'included' && (
                  <button
                    onClick={() => handleFastForwardFinality('counter')}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Fast-Forward L1 Finality (~15m PoS Simulation)
                  </button>
                )}
                {counterTxStatus.status === 'finalized' && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All 5 stages completed: Safe on L1 & Finalized.</span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-center flex flex-col items-center justify-center h-full">
                <Zap className="w-8 h-8 text-zinc-600 mb-3" />
                <span className="text-sm font-semibold text-zinc-300">Awaiting Interaction</span>
                <span className="text-xs text-zinc-500 mt-1">Click &apos;Increment Counter&apos; to trigger preconfirmation tracking.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SIMULATION TAB */}
      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-zinc-500 font-bold">GIWA Pre-Flight Simulation</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-yellow-400">eth_simulateV1</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs text-zinc-400">Target Address (to)</label>
              <input
                type="text"
                value={simTo}
                onChange={(e) => setSimTo(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400">Value (ETH)</label>
              <input
                type="text"
                value={simValue}
                onChange={(e) => setSimValue(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => handleSimulate(false)}
                disabled={simLoading}
                className="w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-400/20"
              >
                <Sparkles className="w-4 h-4" />
                {simLoading ? 'Simulating on Pending Block...' : 'Run eth_simulateV1 (Success)'}
              </button>
              <button
                onClick={() => handleSimulate(true)}
                disabled={simLoading}
                className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition border border-red-900/40"
              >
                <AlertCircle className="w-4 h-4" />
                Simulate Revert Failure
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="text-xs uppercase text-zinc-400 font-bold">Simulation Output</span>
              {simResult && (
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${simResult.success ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                  {simResult.success ? '✓ SUCCESS' : '✕ REVERTED'}
                </span>
              )}
            </div>

            {simResult ? (
              <div className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
                    <span className="text-zinc-500">Gas Used:</span>
                    <p className="text-base font-bold text-zinc-200 mt-1">{simResult.gasUsed.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
                    <span className="text-zinc-500">Simulate Latency:</span>
                    <p className="text-base font-bold text-yellow-400 mt-1">{simResult.durationMs} ms</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
                  <span className="text-zinc-500">Return Data:</span>
                  <p className="font-mono text-zinc-300 mt-1 break-all">{simResult.returnData}</p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                  ⚡ Simulated against the latest GIWA pending Flashblock state via Flashblocks RPC.
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-zinc-500">
                Execute simulation to view pre-flight EVM execution trace and gas estimates.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PAYMENT TAB */}
      {activeTab === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase text-zinc-500 font-bold">Fast Onchain Payment</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-yellow-400">Micro-Transfer</span>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-zinc-800 my-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-400">Amount:</span>
                  <span className="text-yellow-400 font-bold">0.000001 ETH</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Network:</span>
                  <span className="text-zinc-300">GIWA Sepolia</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSendPayment}
              className="w-full py-3.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 transition"
            >
              <Send className="w-4 h-4" />
              Send Micro-Payment (Simulate)
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {paymentState ? (
              <>
                <TransactionTimeline state={paymentState} />
                <FlashLatency
                  preconfirmationMs={paymentState.timeline?.preconfirmationMs}
                  inclusionMs={paymentState.timeline?.inclusionMs}
                  timeSavedMs={paymentState.timeline?.timeSavedMs}
                />
                {paymentState.status === 'included' && (
                  <button
                    onClick={() => handleFastForwardFinality('payment')}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Fast-Forward L1 Finality (~15m PoS Simulation)
                  </button>
                )}
                {paymentState.status === 'finalized' && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All 5 stages completed: Safe on L1 & Finalized.</span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-center flex flex-col items-center justify-center h-full">
                <Send className="w-8 h-8 text-zinc-600 mb-3" />
                <span className="text-sm font-semibold text-zinc-300">Ready to Send</span>
                <span className="text-xs text-zinc-500 mt-1">Send micro-payment to see preconfirmation feedback in action.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MINT TAB */}
      {activeTab === 'mint' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase text-zinc-500 font-bold">Test Contract Write</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-yellow-400">FlashMint.sol</span>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-zinc-800 my-6">
                <span className="text-xs text-zinc-400">Minted Demo Passes:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mintedTokens.map((id) => (
                    <span key={id} className="px-2.5 py-1 rounded bg-zinc-800 text-yellow-400 font-bold text-xs border border-zinc-700">
                      #{id}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleMint}
              className="w-full py-3.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              Mint Next Demo Pass
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {mintState ? (
              <>
                <TransactionTimeline state={mintState} />
                <FlashLatency
                  preconfirmationMs={mintState.timeline?.preconfirmationMs}
                  inclusionMs={mintState.timeline?.inclusionMs}
                  timeSavedMs={mintState.timeline?.timeSavedMs}
                />
                {mintState.status === 'included' && (
                  <button
                    onClick={() => handleFastForwardFinality('mint')}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Fast-Forward L1 Finality (~15m PoS Simulation)
                  </button>
                )}
                {mintState.status === 'finalized' && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All 5 stages completed: Safe on L1 & Finalized.</span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-center flex flex-col items-center justify-center h-full">
                <Sparkles className="w-8 h-8 text-zinc-600 mb-3" />
                <span className="text-sm font-semibold text-zinc-300">Ready to Mint</span>
                <span className="text-xs text-zinc-500 mt-1">Execute mint to observe arbitrary state write preconfirmation.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
