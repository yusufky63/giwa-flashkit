# FlashKit Benchmark Methodology & Disclosure

This document defines the testing methodology, statistical treatment, and disclosures for all latency measurements published by FlashKit.

---

## 1. What FlashKit Measures

FlashKit measures **Application Feedback Latency**, defined as:

```text
Preconfirmation Latency  = T_preconfirmed - T_submitted
Canonical Latency        = T_canonical_included - T_submitted
Early Feedback Advantage = Canonical Latency - Preconfirmation Latency
```

- `T_submitted`: Client timestamp when `eth_sendRawTransaction` returns a transaction hash.
- `T_preconfirmed`: Client timestamp when `eth_getTransactionReceipt` returns non-null on Flashblocks RPC.
- `T_canonical_included`: Client timestamp when `eth_getTransactionReceipt` returns a sealed block receipt on the standard RPC.

---

## 2. Statistical Aggregation

To prevent cherry-picking single fast transactions:
- **Sample Size:** Benchmarks require at least 10 to 50 controlled transactions.
- **Percentiles:** Reported as **p50 (Median)** and **p95** to reflect typical experience and worst-case tail latency.
- **Outlier Reporting:** Minimum and Maximum latency values must be published alongside failure counts.

---

## 3. Disclosures & Integrity Rules

1. **FlashKit does not make the blockchain faster:** The blockchain block time is dictated by the sequencer and consensus settings. Flashblocks exposes transaction state earlier to clients.
2. **Historical transactions:** If a transaction hash is inspected after block inclusion has already passed, preconfirmation latency cannot be retroactively proven without a live observer. FlashKit strictly displays "Preconfirmation timing unavailable" rather than fabricating numbers.
3. **Testnet Resource Conservation:** Benchmark suites must use minimal transaction values (e.g. 0.000001 ETH) and avoid continuous transaction spam to preserve faucet resources.
