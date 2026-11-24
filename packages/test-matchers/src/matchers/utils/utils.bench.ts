import { bench, describe } from 'vitest'
import { deepEqual } from './deepEqual.js'
import { toBeAddress } from './toBeAddress.js'
import { toBeHex } from './toBeHex.js'
import { toEqualAddress } from './toEqualAddress.js'
import { toEqualHex } from './toEqualHex.js'

const checksummed = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
const lowercase = checksummed.toLowerCase()
const hash = `0x${'ab'.repeat(32)}`
const padded = `0x${'00'.repeat(31)}01`
const nested = { a: [1n, 2n, { b: 'x'.repeat(32), c: [true, null] }], d: { e: { f: [hash, hash] } } }

describe('utils matchers', () => {
	bench('toBeAddress (strict checksum)', () => {
		toBeAddress(checksummed)
	})
	bench('toEqualAddress (mixed case)', () => {
		toEqualAddress(lowercase, checksummed)
	})
	bench('toBeHex (size 32)', () => {
		toBeHex(hash, { size: 32 })
	})
	bench('toEqualHex (normalized)', () => {
		toEqualHex(padded, '0x1')
	})
	bench('toEqualHex (exact)', () => {
		toEqualHex(hash, hash.toUpperCase().replace('0X', '0x'), { exact: true })
	})
	bench('deepEqual (nested args)', () => {
		deepEqual(nested, structuredClone(nested))
	})
})
