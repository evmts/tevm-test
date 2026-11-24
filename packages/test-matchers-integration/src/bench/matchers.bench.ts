import { callHandler } from '@tevm/actions'
import { tevmDefault } from '@tevm/common'
import { ErrorContract, SimpleContract } from '@tevm/contract'
import { createMemoryClient, createTevmTransport, tevmDeploy } from '@tevm/memory-client'
import { createTevmNode } from '@tevm/node'
import { PREFUNDED_ACCOUNTS } from '@tevm/utils'
import { createClient, parseEther } from 'viem'
import { writeContract } from 'viem/actions'
import { bench, describe, expect } from 'vitest'

// End-to-end matcher cost against an in-memory TEVM node: each iteration sends a
// transaction and runs the matcher's receipt, log, or trace analysis.
const memoryClient = createMemoryClient()
const viemClient = createClient({
	transport: createTevmTransport(),
	chain: tevmDefault,
	account: PREFUNDED_ACCOUNTS[0],
}).extend(() => ({ mode: 'anvil' }))
const node = createTevmNode()

const setup = (async () => {
	const simple = await memoryClient.tevmDeploy({ ...SimpleContract.deploy(0n), addToBlockchain: true })
	const errors = await tevmDeploy(viemClient, { ...ErrorContract.deploy(), addToBlockchain: true })
	if (!simple.createdAddress || !errors.createdAddress) throw new Error('deploy failed')
	return {
		simple: SimpleContract.withAddress(simple.createdAddress),
		errors: ErrorContract.withAddress(errors.createdAddress),
	}
})()

const sender = PREFUNDED_ACCOUNTS[1]
const recipient = PREFUNDED_ACCOUNTS[2]
const value = parseEther('0.001')

describe('transaction matchers', () => {
	bench('toEmit + withEventArgs', async () => {
		const { simple } = await setup
		await expect(memoryClient.tevmContract(simple.write.set(1n)))
			.toEmit(simple, 'ValueSet')
			.withEventArgs(1n)
	})

	bench('toBeRevertedWithString', async () => {
		const { errors } = await setup
		await expect(writeContract(viemClient, errors.write.revertWithStringError())).toBeRevertedWithString(
			viemClient,
			'This is a string error message',
		)
	})

	bench('toChangeBalances', async () => {
		await expect(
			callHandler(node)({ from: sender.address, to: recipient.address, value, addToBlockchain: true }),
		).toChangeBalances(node, [{ account: recipient, amount: value }])
	})
})
