import { execFile } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { createMemoryClient } from '@tevm/memory-client'
import { PREFUNDED_ACCOUNTS } from '@tevm/utils'
import { custom, type Hex, hexToBigInt, keccak256, numberToHex, parseEther } from 'viem'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Importing the package registers every matcher on vitest's `expect`, exactly as a
// consumer's setup file would.
import '@tevm/test-matchers'
import { createTestSnapshotClient } from '@tevm/test-node'
import { ErrorContract, normalizeRpcUrl, SimpleContract } from '@tevm/test-utils'

const execFileAsync = promisify(execFile)
const packages = ['@tevm/test-matchers', '@tevm/test-node', '@tevm/test-utils'] as const

const runNode = async (script: string) => {
	const { stdout } = await execFileAsync(process.execPath, ['--input-type=module', '-e', script], {
		cwd: process.cwd(),
	})
	return JSON.parse(stdout)
}

describe('published entry points', () => {
	// Consumers run in a plain Node child process: vitest refuses `require()` of
	// vitest-importing modules inside its own runner.
	it.each(packages)('%s imports from dist/index.js as ESM', async (name) => {
		const { path, keys } = await runNode(`
			const esm = await import(${JSON.stringify(name)})
			console.log(JSON.stringify({ path: import.meta.resolve(${JSON.stringify(name)}), keys: Object.keys(esm) }))
		`)
		expect(path).toMatch(/\/dist\/index\.js$/)
		// test-matchers only registers matchers on import; the others export values.
		if (name !== '@tevm/test-matchers') expect(keys.length).toBeGreaterThan(0)
	})

	it('@tevm/test-matchers is not marked side-effect free, so bundlers keep the registering import', () => {
		const pkg = JSON.parse(readFileSync(join(process.cwd(), 'node_modules/@tevm/test-matchers/package.json'), 'utf8'))
		expect(pkg.sideEffects).not.toBe(false)
	})

	it('@tevm/test-utils requires from dist/index.cjs with the same exports as ESM', async () => {
		const { path, cjs, esm } = await runNode(`
			import { createRequire } from 'node:module'
			const require = createRequire(import.meta.url)
			const esm = Object.keys(await import('@tevm/test-utils')).filter((k) => k !== 'default').sort()
			const cjs = Object.keys(require('@tevm/test-utils')).sort()
			console.log(JSON.stringify({ path: require.resolve('@tevm/test-utils'), cjs, esm }))
		`)
		expect(path).toMatch(/[/\\]dist[/\\]index\.cjs$/)
		expect(cjs).toEqual(esm)
	})

	// vitest ships no loadable CommonJS entry, so the vitest-based packages are
	// ESM-only in practice. Pin the failure so a change in either direction is noticed.
	it.each(['@tevm/test-matchers', '@tevm/test-node'])(
		'%s fails to require because vitest is ESM-only',
		async (name) => {
			const { message } = await runNode(`
			import { createRequire } from 'node:module'
			const require = createRequire(import.meta.url)
			try { require(${JSON.stringify(name)}); console.log(JSON.stringify({ message: 'loaded' })) }
			catch (error) { console.log(JSON.stringify({ message: error.message })) }
		`)
			expect(message).toContain('Vitest cannot be imported in a CommonJS module')
		},
	)
})

/**
 * Wraps an in-memory TEVM client as a fork upstream. Local TEVM 1.0.0-rc.151
 * does not serve `eth_getProof`, and its `eth_getStorageAt` right-pads slot
 * values (7 reads back as 0x0700…00), so the shim answers both from
 * `tevmGetAccount`. Proofs are empty because the fork does not verify them.
 */
const EMPTY_TRIE_ROOT = '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421'

const asForkUpstream = (upstream: ReturnType<typeof createMemoryClient>, onRequest: () => void) => {
	const readSlot = async (address: Hex, slot: Hex): Promise<Hex> => {
		const { storage = {} } = await upstream.tevmGetAccount({ address, returnStorage: true, throwOnFail: false })
		const key = Object.keys(storage).find((k) => hexToBigInt(k as Hex) === hexToBigInt(slot)) as Hex | undefined
		return numberToHex(key ? hexToBigInt(storage[key] as Hex) : 0n, { size: 32 })
	}
	return {
		request: async ({ method, params }: { method: string; params?: any }) => {
			onRequest()
			if (method === 'eth_getStorageAt') return readSlot(params[0], params[1])
			// Upstream never advances past the fork block, so state reads use its latest
			// state even when the fork asks about a block it mined locally.
			if (method === 'eth_getCode') return upstream.request({ method, params: [params[0], 'latest'] } as any)
			if (method !== 'eth_getProof') return upstream.request({ method, params } as any)
			const [address, keys] = params as [Hex, Hex[]]
			const account = await upstream.tevmGetAccount({ address, throwOnFail: false })
			return {
				address,
				balance: numberToHex(account.balance ?? 0n),
				nonce: numberToHex(account.nonce ?? 0n),
				codeHash: keccak256(account.deployedBytecode ?? '0x'),
				// The fork reads storage lazily with eth_getStorageAt, so any valid root works.
				storageHash: EMPTY_TRIE_ROOT,
				accountProof: [],
				storageProof: await Promise.all(
					keys.map(async (key) => ({ key, value: await readSlot(address, key), proof: [] })),
				),
			}
		},
	}
}

describe('fork, snapshot, and assert end to end', () => {
	const dir = mkdtempSync(join(tmpdir(), 'tevm-test-e2e-'))
	const snapshotPath = join(dir, 'rpc.snap.json')
	const user = PREFUNDED_ACCOUNTS[1]
	const recipient = PREFUNDED_ACCOUNTS[2]
	// An in-memory TEVM chain stands in for a remote RPC so the test is hermetic.
	const upstream = createMemoryClient()
	let upstreamRequests = 0
	let simpleAddress: `0x${string}`
	let errorAddress: `0x${string}`
	let forkBlock: bigint

	beforeAll(async () => {
		const simple = await upstream.tevmDeploy({ ...SimpleContract.deploy(7n), addToBlockchain: true })
		const errors = await upstream.tevmDeploy({ ...ErrorContract.deploy(), addToBlockchain: true })
		if (!simple.createdAddress || !errors.createdAddress) throw new Error('upstream deploy failed')
		simpleAddress = simple.createdAddress
		errorAddress = errors.createdAddress
		forkBlock = await upstream.getBlockNumber()
	})

	afterAll(() => {
		rmSync(dir, { recursive: true, force: true })
	})

	const forkClient = (transport: { request: (...args: any[]) => Promise<any> }) =>
		createTestSnapshotClient({
			fork: { transport: custom(transport)({ retryCount: 0 }), blockTag: forkBlock },
			test: { resolveSnapshotPath: () => snapshotPath, autosave: 'onRequest' },
		})

	it('forks upstream state and runs every matcher family against the fork', async () => {
		const client = forkClient(
			asForkUpstream(upstream, () => {
				upstreamRequests++
			}),
		)
		const simple = SimpleContract.withAddress(simpleAddress)
		const errors = ErrorContract.withAddress(errorAddress)

		const { data } = await client.tevmContract(simple.read.get())
		expect(data).toBe(7n)
		expect(simpleAddress).toBeAddress()
		expect(simpleAddress.toLowerCase()).toEqualAddress(simpleAddress)

		await expect(client.tevmContract({ ...simple.write.set(42n), addToBlockchain: true }))
			.toEmit(simple, 'ValueSet')
			.withEventArgs(42n)
		expect((await client.tevmContract(simple.read.get())).data).toBe(42n)

		await expect(client.tevmContract(errors.write.revertWithStringError())).toBeRevertedWithString(
			client,
			'This is a string error message',
		)

		const value = parseEther('1')
		await expect(
			client.tevmCall({ from: user.address, to: recipient.address, value, addToBlockchain: true }),
		).toChangeBalance(client, recipient.address, value)

		await client.server.stop()
		expect(upstreamRequests).toBeGreaterThan(0)
		expect(existsSync(snapshotPath)).toBe(true)
		expect(Object.keys(JSON.parse(readFileSync(snapshotPath, 'utf8'))).length).toBeGreaterThan(0)
	})

	it('replays the fork from the snapshot without touching upstream', async () => {
		const client = forkClient({
			request: async () => {
				throw new Error('upstream must not be called when the snapshot is warm')
			},
		})
		const { data } = await client.tevmContract(SimpleContract.withAddress(simpleAddress).read.get())
		expect(data).toBe(7n)
		await client.server.stop()
	})

	it('exposes test-utils helpers from dist', () => {
		expect(normalizeRpcUrl('https://eth-mainnet.alchemyapi.io/v2/k')).toBe('https://eth-mainnet.g.alchemy.com/v2/k')
	})
})
