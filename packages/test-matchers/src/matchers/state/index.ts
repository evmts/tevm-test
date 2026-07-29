import type { TevmNode } from '@tevm/node'
import type { Client } from 'viem'
import { toBeInitializedAccount } from './toBeInitializedAccount.js'
import { toHaveState } from './toHaveState.js'
import { toHaveStorageAt } from './toHaveStorageAt.js'
import type { ExpectedState, ExpectedStorage } from './types.js'

export { toBeInitializedAccount, toHaveState, toHaveStorageAt }

export interface StateMatchers {
	/**
	 * Asserts that an account exists in state — that reading it succeeds and it has a
	 * nonce, balance, storage root, or code hash. Both EOAs that have been touched and
	 * deployed contracts are "initialized"; an address that has never been written to is not.
	 *
	 * @param client - The client or node to use for state queries
	 *
	 * @throws If the received value is not a valid address.
	 *
	 * @example
	 * ```typescript
	 * import { createTevmNode } from '@tevm/node'
	 * import { deployHandler, setAccountHandler } from '@tevm/actions'
	 * import { SimpleContract } from '@tevm/test-utils'
	 * import { expect, it } from 'vitest'
	 *
	 * const node = createTevmNode()
	 *
	 * it('is initialized once written to', async () => {
	 *   const { createdAddress } = await deployHandler(node)({
	 *     ...SimpleContract.deploy(0n),
	 *     addToBlockchain: true,
	 *   })
	 *   await expect(createdAddress).toBeInitializedAccount(node)
	 *
	 *   const untouched = `0x${'9'.repeat(40)}` as const
	 *   await expect(untouched).not.toBeInitializedAccount(node)
	 * })
	 * ```
	 *
	 * @see {@link toHaveState} to check specific state properties
	 */
	toBeInitializedAccount(client: Client | TevmNode): Promise<void>

	/**
	 * Asserts that an account has specific state properties.
	 * Can check balance, nonce, deployedBytecode, and storage in a single assertion.
	 *
	 * Only the keys you provide are compared, and each is compared with strict equality
	 * against the value returned by `getAccount`, so hex values must match byte for byte.
	 *
	 * @param client - The client or node to use for state queries
	 * @param expectedState - The expected state properties (partial match)
	 *
	 * @throws If the received value is not a valid address, or the account cannot be read.
	 *
	 * @example
	 * ```typescript
	 * import { SimpleContract } from '@tevm/test-utils'
	 * import { parseEther, toHex } from 'viem'
	 *
	 * // Check multiple state properties
	 * await expect(contractAddress).toHaveState(node, {
	 *   balance: parseEther('1'),
	 *   nonce: 5n,
	 *   deployedBytecode: SimpleContract.deployedBytecode,
	 *   storage: {
	 *     [toHex(0, { size: 32 })]: toHex(1, { size: 1 }),
	 *   },
	 * })
	 *
	 * // Check only balance
	 * await expect(address).toHaveState(node, { balance: 0n })
	 * ```
	 *
	 * @see {@link toHaveStorageAt} to check only storage
	 * @see {@link toBeInitializedAccount} to check the account exists in state
	 */
	toHaveState(client: Client | TevmNode, expectedState: ExpectedState): Promise<void>

	/**
	 * Asserts that a contract has specific storage values at given slots.
	 *
	 * Slots and values are compared with strict equality against the storage returned by
	 * `getAccount({ returnStorage: true })`, so write them exactly as the node stores them.
	 *
	 * @param client - The client or node to use for state queries
	 * @param expectedStorage - Single storage entry or array of entries
	 *
	 * @throws If the received value is not a valid address, or the account cannot be read.
	 *
	 * @example
	 * ```typescript
	 * import { toHex } from 'viem'
	 *
	 * // Check single storage slot
	 * await expect(contractAddress).toHaveStorageAt(node, {
	 *   slot: toHex(0, { size: 32 }),
	 *   value: toHex(1, { size: 1 }),
	 * })
	 *
	 * // Check multiple storage slots
	 * await expect(contractAddress).toHaveStorageAt(node, [
	 *   { slot: toHex(0, { size: 32 }), value: toHex(1, { size: 1 }) },
	 *   { slot: toHex(1, { size: 32 }), value: toHex(2, { size: 1 }) },
	 * ])
	 * ```
	 *
	 * @see {@link toHaveState} to check multiple state properties
	 */
	toHaveStorageAt(client: Client | TevmNode, expectedStorage: ExpectedStorage): Promise<void>
}
