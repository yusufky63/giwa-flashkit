# GIWA Compatibility Status

This document records the exact network parameters and official GIWA infrastructure verified during the development and release of FlashKit.

---

## Network Profile

- **Network Name:** GIWA Sepolia
- **Chain ID:** `91342`
- **Native Currency:** ETH (18 decimals)
- **Target Block Time:** ~1000 ms (1 second)
- **Preconfirmation Time:** ~200 ms
- **Execution Architecture:** OP Stack with `op-reth`
- **Mainnet Status:** Under Development (not officially available)

---

## Endpoint Verification

| Component | Endpoint / URL | Status | Last Verified |
|---|---|---|---|
| Standard RPC | `https://sepolia-rpc.giwa.io` | ✅ Healthy | 2026-09-17 |
| Flashblocks RPC | `https://sepolia-rpc-flashblocks.giwa.io` | ✅ Healthy | 2026-09-17 |
| Blockscout Explorer | `https://sepolia-explorer.giwa.io` | ✅ Reachable | 2026-09-17 |
| `eth_simulateV1` | Supported on Flashblocks RPC | ✅ Verified | 2026-09-17 |
| `pending` Block Tag | Supported on Flashblocks RPC | ✅ Verified | 2026-09-17 |
| Upstream `viem` | `giwaSepolia`, `giwaSepoliaPreconf` | ✅ Integrated (v2.56.x) | 2026-09-17 |

---

## Node Operator Compatibility

Self-hosted GIWA nodes running `giwa-io/node` with `FLASHBLOCKS_WEBSOCKET_URL` enabled can be configured directly in FlashKit:

```typescript
createFlashKit({
  network: 'giwaSepolia',
  rpc: {
    canonical: 'http://localhost:8545',
    flashblocks: 'http://localhost:8546'
  }
})
```
