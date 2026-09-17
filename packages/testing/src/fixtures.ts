import type { Hex, TransactionReceipt } from 'viem'

export const SAMPLE_GIWA_ADDRESSES = {
  deployer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const,
  recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
  counterContract: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const,
  mintContract: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' as const
}

export const SAMPLE_HASHES: Hex[] = [
  '0x8a0217b8e9b63428d0958197bb781f7215f5e7f1aa670ecb19280d463b207567',
  '0xf9ccf33903caddfe3d5dc647d253d9de8700041b7c1dff9c03dd69809c94baca',
  '0xb24b725c219e1436c5eb606d2008aa824ebd16323d6914b309a104dc5dd92927'
]

export function createMockReceipt(
  hash: Hex,
  blockNumber: bigint = 36325513n,
  isReverted = false
): TransactionReceipt {
  return {
    blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111' as Hex,
    blockNumber,
    contractAddress: null,
    cumulativeGasUsed: 21000n,
    effectiveGasPrice: 1000000000n,
    from: SAMPLE_GIWA_ADDRESSES.deployer,
    gasUsed: 21000n,
    logs: [],
    logsBloom: '0x00' as Hex,
    status: isReverted ? 'reverted' : 'success',
    to: SAMPLE_GIWA_ADDRESSES.recipient,
    transactionHash: hash,
    transactionIndex: 0,
    type: 'legacy'
  }
}
