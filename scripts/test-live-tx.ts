import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  type Hash
} from 'viem'
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts'
import { giwaSepolia, giwaSepoliaPreconf } from 'viem/chains'
import fs from 'node:fs'
import path from 'node:path'

async function main() {
  console.log('='.repeat(65))
  console.log('⚡ FLASHKIT — LIVE ONCHAIN TESTNET TRANSACTION RUNNER')
  console.log('='.repeat(65))

  const walletFilePath = path.join(process.cwd(), '.test-wallet.json')
  let privateKey: `0x${string}`

  if (process.env.TEST_PRIVATE_KEY) {
    privateKey = process.env.TEST_PRIVATE_KEY as `0x${string}`
    console.log('Using private key from environment: $env:TEST_PRIVATE_KEY')
  } else if (fs.existsSync(walletFilePath)) {
    const raw = fs.readFileSync(walletFilePath, 'utf-8').trim().replace(/^\uFEFF/, '')
    const data = JSON.parse(raw)
    privateKey = data.privateKey
    console.log('Using saved testnet wallet from .test-wallet.json')
  } else {
    privateKey = generatePrivateKey()
    fs.writeFileSync(walletFilePath, JSON.stringify({
      privateKey,
      createdAt: new Date().toISOString(),
      instructions: 'Fund this address on GIWA Sepolia to execute real live transactions'
    }, null, 2))
    console.log('Generated fresh testnet wallet and saved to .test-wallet.json')
  }

  const account = privateKeyToAccount(privateKey)
  console.log(`\n🔑 Testnet Address: ${account.address}`)

  const standardClient = createPublicClient({
    chain: giwaSepolia,
    transport: http('https://sepolia-rpc.giwa.io')
  })
  const flashClient = createPublicClient({
    chain: giwaSepoliaPreconf,
    transport: http('https://sepolia-rpc-flashblocks.giwa.io')
  })

  // Check balance
  const balance = await standardClient.getBalance({ address: account.address })
  console.log(`💰 Current Balance: ${formatEther(balance)} ETH on GIWA Sepolia`)

  if (balance === 0n) {
    console.log('\n⚠️  BAKİYE BULUNAMADI (0 ETH):')
    console.log('Bu testin zincir üstünde gerçek işlem (onchain transaction) gönderebilmesi için')
    console.log('aşağıdaki adrese GIWA Sepolia testnet ETH gönderebilir veya faucet kullanabilirsiniz:')
    console.log(`\n👉 ${account.address}`)
    console.log('\nMusluklar (Faucets):')
    console.log('  - GIWA Faucet:       https://faucet.giwa.io')
    console.log('  - Superchain Faucet: https://console.optimism.io/faucet')
    console.log('\nCüzdana bakiye geçtikten sonra bu komutu tekrar çalıştırmanız yeterlidir:')
    console.log('  pnpm test:onchain\n')
    return
  }

  console.log('\n🚀 Bakiye mevcut! Gerçek onchain işlem GIWA Sepolia ağına broadcast ediliyor...')

  const wallet = createWalletClient({
    account,
    chain: giwaSepolia,
    transport: http('https://sepolia-rpc.giwa.io')
  })

  const tStart = performance.now()
  const hash = await wallet.sendTransaction({
    to: account.address,
    value: 1n // 1 wei micro-transfer
  })

  const submittedAt = performance.now()
  const broadcastMs = Math.round(submittedAt - tStart)
  console.log(`\n📡 İşlem Ağda Yayınlandı (Broadcasted in ${broadcastMs}ms):`)
  console.log(`   Tx Hash: ${hash}`)
  console.log(`   Gezgin:  https://sepolia-explorer.giwa.io/tx/${hash}`)

  console.log('\nFlashblocks RPC üzerinden preconfirmation bekleniyor (~200ms)...')
  let preconfMs: number | null = null

  const pollStart = performance.now()
  while (performance.now() - pollStart < 15000) {
    if (preconfMs === null) {
      try {
        const flashReceipt = await flashClient.getTransactionReceipt({ hash })
        if (flashReceipt) {
          preconfMs = Math.round(performance.now() - submittedAt)
          console.log(`⚡ [PRECONFIRMED] ~${preconfMs}ms içinde Flashblock sequencer tarafından sıralandı!`)
        }
      } catch {
        // henüz pending flashblockta değil
      }
    }

    if (preconfMs !== null) {
      try {
        const standardReceipt = await standardClient.getTransactionReceipt({ hash })
        if (standardReceipt) {
          const canonicalMs = Math.round(performance.now() - submittedAt)
          const timeSaved = canonicalMs - preconfMs
          console.log(`📦 [CANONICAL BLOCK] #${standardReceipt.blockNumber} bloğuna mühürlendi (${canonicalMs}ms)!`)
          console.log(`✨ Flashblocks erken sinyali sayesinde kazanılan UI avantajı: +${timeSaved}ms`)
          console.log('\n' + '='.repeat(65))
          console.log('✅ GERÇEK ZİNCİR ÜSTÜ TEST BAŞARIYLA TAMAMLANDI!')
          console.log('='.repeat(65) + '\n')
          return
        }
      } catch {
        // henüz standart blokta değil
      }
    }

    await new Promise((r) => setTimeout(r, 80))
  }

  console.log('Zaman aşımı: İşlem standart blok polling ile devam ediyor...')
}

main().catch((err) => {
  console.error('Hata:', err)
  process.exit(1)
})
