# @tevm/test-matchers

## 1.0.0

### Patch Changes

- [`8f91c27`](https://github.com/evmts/tevm-test/commit/8f91c278725c2407185fb7c4d39465663572c72b) Thanks [@roninjin10](https://github.com/roninjin10)! - Correct and expand JSDoc: `toBeInitializedAccount` documents that it asserts the account exists in state (not that it has code), `toHaveState` documents `deployedBytecode` rather than a nonexistent `code` field and its strict-equality comparison, and `getAlchemyUrl` and `transports` gain full docs with examples.

- [#2](https://github.com/evmts/tevm-test/pull/2) [`1cfa328`](https://github.com/evmts/tevm-test/commit/1cfa3284fdffdde4a85e3e0892c2c2d1c7a2a616) Thanks [@roninjin10](https://github.com/roninjin10)! - `@tevm/test-matchers`: `toEmit` (and `.not.toEmit`) now fail with the transaction error when the received promise rejects instead of passing; chained matchers such as `withEventArgs` surface the earlier failure instead of a misleading "requires a contract" error. The package is no longer marked `sideEffects: false`, so bundlers keep `import '@tevm/test-matchers'`.

  `@tevm/test-utils`: `getAlchemyUrl('mainnet')` uses `eth-mainnet.g.alchemy.com` instead of the retired `alchemyapi.io` host. New `normalizeRpcUrl` rewrites retired hosts, and `transports` trims, filters, and normalizes `TEVM_RPC_URLS_*` entries.

- [`b5bd8e4`](https://github.com/evmts/tevm-test/commit/b5bd8e477b5668616a7e3c0f2bc984302f639781) Thanks [@roninjin10](https://github.com/roninjin10)! - Publish the TEVM test libraries from their standalone repository.

## 1.0.0-rc.151

### Patch Changes

- 2d9d44b: bumping potentially one last time before release
- 725f0ae: Bug fixes to lots of packages done with ai and no changeset
- Updated dependencies [2d9d44b]
- Updated dependencies [725f0ae]
  - @tevm/actions@1.0.0-rc.151
  - @tevm/utils@1.0.0-rc.151
  - @tevm/node@1.0.0-rc.151
  - @tevm/contract@1.0.0-rc.151
  - @tevm/errors@1.0.0-rc.151

## 1.0.0-next.149

### Patch Changes

- f9977b5: Extend test-matchers, add test-node package & improve 4byte tracer
- Updated dependencies [f9977b5]
  - @tevm/contract@1.0.0-next.149
  - @tevm/actions@1.0.0-next.149

## 1.0.0-next.148

### Patch Changes

- c337f69: Internal release
- Updated dependencies [826c7fa]
- Updated dependencies [9e0e1cd]
- Updated dependencies [c337f69]
- Updated dependencies [05fa934]
  - @tevm/actions@1.0.0-next.148
  - @tevm/errors@1.0.0-next.148
  - @tevm/utils@1.0.0-next.148
