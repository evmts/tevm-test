---
"@tevm/test-matchers": patch
"@tevm/test-utils": patch
---

`@tevm/test-matchers`: `toEmit` (and `.not.toEmit`) now fail with the transaction error when the received promise rejects instead of passing; chained matchers such as `withEventArgs` surface the earlier failure instead of a misleading "requires a contract" error. The package is no longer marked `sideEffects: false`, so bundlers keep `import '@tevm/test-matchers'`.

`@tevm/test-utils`: `getAlchemyUrl('mainnet')` uses `eth-mainnet.g.alchemy.com` instead of the retired `alchemyapi.io` host. New `normalizeRpcUrl` rewrites retired hosts, and `transports` trims, filters, and normalizes `TEVM_RPC_URLS_*` entries.
