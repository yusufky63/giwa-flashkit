'use client'

import React, { useState } from 'react'
import type { Hex } from 'viem'
import { Terminal, Search, ExternalLink, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { createFlashKit, type FlashTransactionState } from '@flashkit/core'
import { FlashStatus, TransactionTimeline, FlashLatency, TransactionResult } from '@flashkit/ui'

export default function InspectorPage() {
  const [inputHash, setInputHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txState, setTxState] = useState<FlashTransactionState | null>(null)
  const [isHistorical, setIsHistorical] = useState(false)

  const handleInspect = async (hashToInspect?: string) => {
    const target = (hashToInspect || inputHash).trim()
    if (!target || !target.startsWith('0x') || target.length !== 66) {
      setError('Please enter a valid 66-character 0x transaction hash.')
      return
    }

    setError(null)
    setLoading(true)
    setIsHistorical(false)
    setTxState(null)

    try {
      const flashkit = createFlashKit()

      // Fetch canonical receipt to see if it exists
      const standardReceipt = await flashkit.canonicalClient.getTransactionReceipt({
        hash: target as Hex
      }).catch(() => null)

      if (standardReceipt) {
        // Historical transaction: canonical receipt exists already
        setIsHistorical(true)
        const block = await flashkit.canonicalClient.getBlock({ blockNumber: standardReceipt.blockNumber })
        const finality = await flashkit.canonicalClient.getBlock({ blockTag: 'finalized' }).catch(() => null)
        const isFinalized = finality?.number ? standardReceipt.blockNumber <= finality.number : false

        setTxState({
          hash: target as Hex,
          status: isFinalized ? 'finalized' : 'included',
          blockNumber: standardReceipt.blockNumber,
          receipt: standardReceipt,
          timeline: {
            submittedAt: Number(block.timestamp) * 1000,
            includedAt: Number(block.timestamp) * 1000
            // Preconfirmation timing explicitly omitted per integrity rule
          },
          degradedMode: false
        })
      } else {
        // Live / pending transaction: track it live!
        const tracker = flashkit.trackTransaction(target as Hex)
        setTxState(tracker.getState())

        tracker.on('status', ({ state }) => {
          setTxState(state)
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to inspect transaction.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 font-mono">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>FlashKit Inspector</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          GIWA Transaction Telemetry & Inspector
        </h1>
        <p className="text-zinc-400 text-sm">
          Inspect live or historical GIWA Sepolia transactions. Analyze Flashblocks preconfirmation timing, canonical block inclusion, and OP Stack finality.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 shadow-xl mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleInspect()
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="text"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              placeholder="Enter GIWA Sepolia transaction hash (0x...)"
              className="w-full bg-black/60 border border-zinc-700/70 rounded-lg pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            {loading ? 'Inspecting...' : 'Inspect Transaction'}
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Sample Transactions */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="text-zinc-500 font-semibold">Try sample:</span>
          <button
            type="button"
            onClick={() => {
              const h = '0x110556c14948c5836dfddf5a1b1c90c9016a920315ac5352a5fc4ed9c6601065'
              setInputHash(h)
              handleInspect(h)
            }}
            className="px-2.5 py-1 rounded bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 font-mono transition border border-yellow-400/40 font-bold"
          >
            ⚡ Live Onchain Tx (0x1105...)
          </button>
          <button
            type="button"
            onClick={() => {
              const h = '0xa8f26e17406e0942736fc7d9d8088d61d819aef79bf98e6541fff9b528d40233'
              setInputHash(h)
              handleInspect(h)
            }}
            className="px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-mono transition border border-zinc-700/60"
          >
            Sepolia Tx (0xa8f2...)
          </button>
        </div>
      </div>

      {/* Results View */}
      {txState && (
        <div className="flex flex-col gap-6">
          {/* Historical integrity banner */}
          {isHistorical && (
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400">
              <Clock className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-200 font-semibold">Historical Transaction Notice:</span>{' '}
                This transaction was already confirmed on GIWA Sepolia prior to this inspection session. Per FlashKit Benchmark & Telemetry Integrity Rules, historical preconfirmation latency is marked as{' '}
                <span className="text-yellow-400">Unavailable</span> rather than fabricated.
              </div>
            </div>
          )}

          {/* Latency & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TransactionTimeline state={txState} />
            <div className="flex flex-col gap-6">
              <FlashLatency
                preconfirmationMs={txState.timeline.preconfirmationMs}
                inclusionMs={txState.timeline.inclusionMs}
                timeSavedMs={txState.timeline.timeSavedMs}
              />
              <TransactionResult state={txState} />
            </div>
          </div>
        </div>
      )}

      {/* Empty State / Quick Help */}
      {!txState && !loading && (
        <div className="p-8 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-center flex flex-col items-center justify-center">
          <Terminal className="w-8 h-8 text-zinc-600 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300">Ready to Inspect</h3>
          <p className="text-xs text-zinc-500 max-w-md mt-1">
            Submit a transaction in the Playground to watch its Flashblocks preconfirmation unfold live in sub-250ms, or inspect any GIWA Sepolia transaction hash.
          </p>
        </div>
      )}
    </div>
  )
}
