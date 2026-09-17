# Security Policy

## 1. Security Architecture & Boundary

FlashKit is intentionally designed with a strict security boundary:
- **No Key Custody:** FlashKit never requests, stores, or handles private keys or seed phrases.
- **Client-Side Only:** FlashKit operates inside the developer's application or server. No centralized relay or proxy is required.
- **Calldata Integrity:** FlashKit never modifies calldata, gas limits, or transaction destinations.

## 2. Testnet Only Notice

All demo contracts (`FlashCounter.sol`, `FlashMint.sol`) and test tokens deployed on GIWA Sepolia have zero economic value.

## 3. Reporting a Vulnerability

If you discover a security vulnerability in FlashKit, please do not file a public GitHub issue. Instead, report it privately to the maintainers or via GitHub Security Advisories.
