import { isDeepStrictEqual } from 'node:util'
import fc from 'fast-check'
import { bytesToHex, getAddress, padHex } from 'viem'
import { describe, expect, it } from 'vitest'
import { deepEqual } from './deepEqual.js'
import { toBeAddress } from './toBeAddress.js'
import { toBeHex } from './toBeHex.js'
import { toEqualAddress } from './toEqualAddress.js'
import { toEqualHex } from './toEqualHex.js'

// Property-based (fuzz) tests for the pure matchers. Each property runs against
// generated inputs; fast-check shrinks any failure to a minimal counterexample.
const runs = { numRuns: 500 }

const bytes20 = fc.uint8Array({ minLength: 20, maxLength: 20 })
const anyBytes = fc.uint8Array({ minLength: 0, maxLength: 64 })
const nonHexString = fc.string().filter((s) => !/^0x[0-9a-fA-F]*$/.test(s))
const randomCase = (hex: string, flips: boolean[]) =>
	`0x${[...hex.slice(2)].map((c, i) => (flips[i % flips.length] ? c.toUpperCase() : c.toLowerCase())).join('')}`

describe('toBeAddress (property)', () => {
	it('accepts every checksummed 20-byte address', () => {
		fc.assert(
			fc.property(bytes20, (b) => toBeAddress(getAddress(bytesToHex(b))).pass),
			runs,
		)
	})

	it('accepts any casing when strict is false', () => {
		fc.assert(
			fc.property(
				bytes20,
				fc.array(fc.boolean(), { minLength: 1 }),
				(b, flips) => toBeAddress(randomCase(bytesToHex(b), flips), { strict: false }).pass,
			),
			runs,
		)
	})

	it('rejects hex of any length other than 20 bytes', () => {
		fc.assert(
			fc.property(
				anyBytes.filter((b) => b.length !== 20),
				(b) => !toBeAddress(bytesToHex(b), { strict: false }).pass,
			),
			runs,
		)
	})

	it('rejects non-string values', () => {
		fc.assert(
			fc.property(
				fc.anything().filter((v) => typeof v !== 'string'),
				(v) => !toBeAddress(v).pass,
			),
			runs,
		)
	})
})

describe('toEqualAddress (property)', () => {
	it('treats every casing of the same address as equal', () => {
		fc.assert(
			fc.property(bytes20, fc.array(fc.boolean(), { minLength: 1 }), (b, flips) => {
				const hex = bytesToHex(b)
				return toEqualAddress(randomCase(hex, flips), getAddress(hex)).pass
			}),
			runs,
		)
	})

	it('agrees with byte equality and is symmetric', () => {
		fc.assert(
			fc.property(bytes20, bytes20, (a, b) => {
				const ha = bytesToHex(a)
				const hb = bytesToHex(b)
				const same = ha === hb
				return toEqualAddress(ha, hb).pass === same && toEqualAddress(hb, ha).pass === same
			}),
			runs,
		)
	})
})

describe('toBeHex (property)', () => {
	it('accepts every byte string and checks its size', () => {
		fc.assert(
			fc.property(anyBytes, fc.nat({ max: 64 }), (b, size) => {
				const hex = bytesToHex(b)
				return toBeHex(hex).pass && toBeHex(hex, { size }).pass === (size === b.length)
			}),
			runs,
		)
	})

	it('rejects strings that are not 0x-prefixed hex', () => {
		fc.assert(
			fc.property(nonHexString, (s) => !toBeHex(s).pass),
			runs,
		)
	})
})

describe('toEqualHex (property)', () => {
	it('ignores leading zero padding by default', () => {
		fc.assert(
			fc.property(fc.uint8Array({ minLength: 1, maxLength: 32 }), fc.nat({ max: 32 }), (b, extra) => {
				const hex = bytesToHex(b)
				const padded = padHex(hex, { size: b.length + extra })
				return toEqualHex(hex, padded).pass && toEqualHex(padded, hex).pass
			}),
			runs,
		)
	})

	it('matches exact comparison to case-insensitive string equality', () => {
		fc.assert(
			fc.property(anyBytes, anyBytes, fc.array(fc.boolean(), { minLength: 1 }), (a, b, flips) => {
				const ha = bytesToHex(a)
				const hb = bytesToHex(b)
				return (
					toEqualHex(randomCase(ha, flips), ha, { exact: true }).pass &&
					toEqualHex(ha, hb, { exact: true }).pass === (ha === hb)
				)
			}),
			runs,
		)
	})

	it('agrees with numeric equality for normalized comparison', () => {
		fc.assert(
			fc.property(
				fc.bigInt({ min: 0n, max: 2n ** 256n - 1n }),
				fc.bigInt({ min: 0n, max: 2n ** 256n - 1n }),
				(x, y) => {
					const hx = `0x${x.toString(16)}`
					const hy = `0x${y.toString(16).padStart(64, '0')}`
					return toEqualHex(hx, hy).pass === (x === y)
				},
			),
			runs,
		)
	})

	it('rejects non-hex input on either side', () => {
		fc.assert(
			fc.property(
				nonHexString,
				anyBytes,
				(s, b) => !toEqualHex(s, bytesToHex(b)).pass && !toEqualHex(bytesToHex(b), s).pass,
			),
			runs,
		)
	})
})

describe('deepEqual (property)', () => {
	it('is reflexive on structural clones', () => {
		fc.assert(
			fc.property(fc.jsonValue(), (v) => deepEqual(v, structuredClone(v))),
			runs,
		)
	})

	it('agrees with node:util isDeepStrictEqual on JSON values', () => {
		fc.assert(
			fc.property(fc.jsonValue(), fc.jsonValue(), (a, b) => deepEqual(a, b) === isDeepStrictEqual(a, b)),
			runs,
		)
	})

	it('treats bigints by value', () => {
		fc.assert(
			fc.property(fc.bigInt(), fc.bigInt(), (a, b) => deepEqual({ a: [a] }, { a: [b] }) === (a === b)),
			runs,
		)
	})
})

it('has expect integration for generated addresses', () => {
	fc.assert(
		fc.property(bytes20, (b) => {
			expect(bytesToHex(b)).toEqualAddress(getAddress(bytesToHex(b)))
		}),
		{ numRuns: 50 },
	)
})
