# Contributing to FlashKit

We welcome contributions to FlashKit from across the GIWA ecosystem!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yusufky63/giwa-flashkit.git
cd giwa-flashkit

# Install dependencies
pnpm install

# Run contract tests
cd contracts && forge test

# Run SDK unit tests
pnpm test

# Run Next.js web playground & inspector locally
pnpm --filter web dev
```

## Pull Request Checklist

Before submitting a pull request, ensure:
1. `pnpm test` passes all unit tests.
2. `forge test` passes smart contract test suites.
3. `pnpm --filter web build` builds the web application cleanly.
4. New features include appropriate Vitest tests.
