# GIWA Transaction Lifecycle & Finality Guide

A core principle of FlashKit is maintaining strict semantic precision regarding transaction states.

## Why "Preconfirmed" Is Not "Finalized"

On traditional Ethereum L1, transactions are either in the mempool or included in a block.

On GIWA (an OP Stack L2 with Flashblocks), there are **five distinct stages of confidence**:

```text
IDLE
 │
 ▼
SUBMITTED       (1) User wallet signs & broadcasts tx to sequencer
 │
 ▼
PRECONFIRMED ⚡  (2) Sequencer orders tx in Flashblock (~200ms)
 │
 ▼
INCLUDED 📦     (3) Sealed inside a canonical 1-second L2 block
 │
 ▼
SAFE 🔒         (4) L2 block batch posted to Ethereum L1 contract
 │
 ▼
FINALIZED 🏛️    (5) Underlying Ethereum L1 block has finalized (~12-15 minutes)
```

---

## Detailed Stage Definitions

### 1. `SUBMITTED`
- The user signed the payload and transmitted it to the sequencer.
- Network latency determines the round-trip time.
- **UI Guidance:** Show spinning loader, disable re-submission button.

### 2. `PRECONFIRMED` (~200 ms)
- The sequencer has ordered the transaction inside the active sub-block (Flashblock).
- The state transition can already be observed using `pending` block queries (`eth_call`, `eth_getBalance`, `eth_getTransactionReceipt`).
- **UI Guidance:** Render optimistic checkmark, play micro-animation, unlock user interface. Do not require the user to wait for canonical inclusion.
- **Warning:** Must never be labeled "Finalized".

### 3. `INCLUDED` (~1,000 ms)
- The transaction has been sealed inside a full, canonical GIWA L2 block.
- An official receipt with `status: 1` (or `status: 0` if reverted), gas used, and logs is now permanently available on both canonical RPC and Blockscout.

### 4. `SAFE`
- The sequencer has bundled this L2 block into a batch and submitted the calldata/blob to the Ethereum L1 batch inbox.
- Re-org risk is now tied to Ethereum L1 re-org dynamics rather than sequencer state.

### 5. `FINALIZED`
- The Ethereum L1 block containing the L2 transaction batch has itself achieved Casper finality.
- Irreversible without breaking Ethereum consensus.

---

## Exceptional / Terminal States

- `REVERTED`: The EVM executed the transaction, but a `revert` or `require` condition failed. Gas is consumed.
- `REPLACED`: The user submitted a new transaction with the same nonce and higher gas.
- `DROPPED`: The transaction was rejected by the sequencer before ordering.
- `TIMEOUT`: The transaction was not observed in a block within the configured tracking window.
