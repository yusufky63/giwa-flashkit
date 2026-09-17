'use client'

import React, { useState } from 'react'
import { Droplet, ExternalLink, ShieldCheck, Plus, CheckCircle2, Copy } from 'lucide-react'

export default function FaucetsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [networkAdded, setNetworkAdded] = useState(false)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const addGiwaToMetaMask = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x164ce', // 91342
              chainName: 'GIWA Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia-rpc.giwa.io'],
              blockExplorerUrls: ['https://sepolia-explorer.giwa.io']
            }
          ]
        })
        setNetworkAdded(true)
        setTimeout(() => setNetworkAdded(false), 3000)
      } catch (err) {
        console.error('Failed to add GIWA Sepolia:', err)
      }
    } else {
      alert('MetaMask or Web3 wallet extension not detected in this browser.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 font-mono text-zinc-300">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
          <Droplet className="w-4 h-4" />
          <span>Faucets & Network Setup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          GIWA Sepolia Testnet Faucets
        </h1>
        <p className="text-zinc-400 text-sm">
          Get testnet ETH to deploy smart contracts and test FlashKit Flashblocks preconfirmation transactions.
        </p>
      </div>

      {/* One-Click Add Network Button */}
      <div className="p-6 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white">Add GIWA Sepolia to Wallet</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Configure MetaMask or any EVM wallet automatically with Chain ID 91342.
          </p>
        </div>
        <button
          onClick={addGiwaToMetaMask}
          className="px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-2 transition shadow-md shadow-yellow-400/20 whitespace-nowrap"
        >
          {networkAdded ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {networkAdded ? 'Added to Wallet!' : 'Add Network to Wallet'}
        </button>
      </div>

      {/* Faucet Cards */}
      <div className="mb-12">
        {/* Official GIWA Faucet */}
        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase text-yellow-400">Official Foundation Faucet</span>
              <span className="text-zinc-600">|</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold">Up to 0.005 ETH / 24h</span>
            </div>
            <h3 className="text-xl font-bold text-white">GIWA Sepolia Faucet</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              The primary official faucet maintained by the GIWA foundation. Use it to receive testnet Sepolia ETH directly to your developer address for contract deployment and Flashblocks transaction testing.
            </p>
          </div>
          <a
            href="https://faucet.giwa.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold transition shadow-lg shadow-yellow-400/20 whitespace-nowrap"
          >
            Claim Testnet ETH <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Network Parameters Table */}
      <div className="p-6 rounded-xl bg-black border border-zinc-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Manual Network Configuration
        </h3>
        <div className="divide-y divide-zinc-800/80 text-xs">
          {[
            { label: 'Network Name', value: 'GIWA Sepolia', id: 'name' },
            { label: 'Chain ID', value: '91342', id: 'chainid' },
            { label: 'Currency Symbol', value: 'ETH', id: 'symbol' },
            { label: 'Standard RPC URL', value: 'https://sepolia-rpc.giwa.io', id: 'rpc' },
            { label: 'Flashblocks RPC URL', value: 'https://sepolia-rpc-flashblocks.giwa.io', id: 'flash' },
            { label: 'Block Explorer URL', value: 'https://sepolia-explorer.giwa.io', id: 'explorer' }
          ].map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <span className="text-zinc-500">{item.label}:</span>
              <div className="flex items-center gap-2 font-mono text-zinc-200">
                <span className="break-all">{item.value}</span>
                <button
                  onClick={() => copyToClipboard(item.value, item.id)}
                  className="text-zinc-500 hover:text-yellow-400 transition"
                  title="Copy"
                >
                  {copied === item.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
