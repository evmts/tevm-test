import { parseAbi } from 'viem'
import { describe, expect, it } from 'vitest'

// A transaction that rejects never emitted anything. toEmit must surface the
// transaction error instead of passing or failing on a later chained call.
describe('toEmit with a rejected transaction', () => {
	const contract = { abi: parseAbi(['event ValueSet(uint256 newValue)']) }
	const rejected = () => Promise.reject(new Error('tx failed: nonce too low'))

	it('fails with the transaction error', async () => {
		await expect(expect(rejected()).toEmit('ValueSet(uint256)')).rejects.toThrow('tx failed: nonce too low')
	})

	it('fails with the transaction error when negated', async () => {
		await expect(expect(rejected()).not.toEmit('ValueSet(uint256)')).rejects.toThrow('tx failed: nonce too low')
	})

	it('fails with the transaction error before a chained withEventArgs runs', async () => {
		await expect(expect(rejected()).toEmit(contract, 'ValueSet').withEventArgs(1n)).rejects.toThrow(
			'tx failed: nonce too low',
		)
	})

	it('still passes for a resolved transaction carrying the event', async () => {
		await expect(Promise.resolve({ logs: [] })).not.toEmit('ValueSet(uint256)')
	})
})
