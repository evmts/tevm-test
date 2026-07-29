# TEVM Test

TEVM Test is the standalone home for TEVM's testing libraries. It provides
Vitest matchers for EVM behavior, a snapshot-aware test node, and reusable
contract fixtures and test utilities.

These packages build on [TEVM](https://tevm.sh), but release independently so
test tooling can evolve without locking its version to the core monorepo.
Package API documentation is available at [test.tevm.sh](https://test.tevm.sh).

## Packages

| Package | Purpose |
| --- | --- |
| [`@tevm/test-matchers`](./packages/test-matchers) | Vitest matchers for balances, events, reverts, contract calls, and state |
| [`@tevm/test-node`](./packages/test-node) | A TEVM test node and transport with deterministic JSON-RPC snapshots |
| [`@tevm/test-utils`](./packages/test-utils) | Reusable contracts, fixtures, transports, and testing helpers |

## Install

Install the packages you need with pnpm:

```sh
pnpm add -D @tevm/test-matchers @tevm/test-node @tevm/test-utils
```

The matcher and test-node packages use TEVM at runtime, so applications should
also install the core package:

```sh
pnpm add tevm
```

## Vitest matchers

Load the matchers from a Vitest setup file:

```ts
import '@tevm/test-matchers'
```

Then register that setup file in `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		setupFiles: ['./vitest.setup.ts'],
	},
})
```

## Snapshot test node

`@tevm/test-node` records forked JSON-RPC responses next to a test, making
fork-based suites reproducible:

```ts
import { createTestSnapshotNode } from '@tevm/test-node'
import { http } from 'viem'

const node = createTestSnapshotNode({
	fork: { transport: http('https://mainnet.optimism.io')() },
})

await node.server.start()
// Run assertions against the node.
await node.server.stop()
```

## Development

This repository requires Node 24 and pnpm 9.

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Releases are managed with Changesets and published from GitHub Actions with npm
provenance.
