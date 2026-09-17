import type { Hex, PublicClient, TransactionReceipt } from 'viem'

export async function fetchPreconfirmationReceipt(
  flashClient: PublicClient,
  hash: Hex
): Promise<TransactionReceipt | null> {
  try {
    const receipt = await flashClient.getTransactionReceipt({ hash })
    return receipt ?? null
  } catch {
    return null
  }
}

export async function fetchCanonicalReceipt(
  canonicalClient: PublicClient,
  hash: Hex
): Promise<TransactionReceipt | null> {
  try {
    const receipt = await canonicalClient.getTransactionReceipt({ hash })
    return receipt ?? null
  } catch {
    return null
  }
}
