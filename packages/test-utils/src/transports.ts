import { loadBalance, rateLimit } from '@ponder/utils'
import { http } from 'viem'
import { mainnet as viemMainnet, optimism as viemOptimism } from 'viem/chains'
import { normalizeRpcUrl } from './getAlchemyUrl.js'

const readRpcUrls = (name: string): string[] =>
	(process.env[name]?.split(',') ?? [])
		.map((url) => url.trim())
		.filter(Boolean)
		.map(normalizeRpcUrl)

const mainnetRpcUrls = readRpcUrls('TEVM_RPC_URLS_MAINNET')
const optimismRpcUrls = readRpcUrls('TEVM_RPC_URLS_OPTIMISM')

if (mainnetRpcUrls.length === 0) {
	console.warn('TEVM_RPC_URLS_MAINNET is not set')
}
if (optimismRpcUrls.length === 0) {
	console.warn('TEVM_RPC_URLS_OPTIMISM is not set')
}

const mainnet = loadBalance(
	mainnetRpcUrls.map((url) => rateLimit(http(url), { browser: false, requestsPerSecond: 150 })),
)({ retryCount: 3, chain: viemMainnet })

const optimism = loadBalance(
	optimismRpcUrls.map((url) => rateLimit(http(url), { browser: false, requestsPerSecond: 150 })),
)({ retryCount: 3, chain: viemOptimism })

/**
 * Pre-built viem transports for mainnet and Optimism, load balanced across the comma-separated
 * endpoints in `TEVM_RPC_URLS_MAINNET` and `TEVM_RPC_URLS_OPTIMISM`, rate limited to 150 requests
 * per second with 3 retries. Entries are trimmed, empty entries are dropped, and retired
 * `*.alchemyapi.io` hosts are rewritten with {@link normalizeRpcUrl}.
 *
 * The environment is read at module load time. If a variable is unset, a warning is logged and the
 * corresponding transport is a load balancer with no endpoints, which fails on first request — use
 * {@link getAlchemyUrl} with viem's `http` if you can't set the variables.
 *
 * @example
 * ```typescript
 * import { createTestSnapshotClient } from '@tevm/test-node'
 * import { transports } from '@tevm/test-utils'
 *
 * const client = createTestSnapshotClient({
 *   fork: { transport: transports.optimism },
 * })
 * ```
 */
export const transports = {
	mainnet,
	optimism,
}
