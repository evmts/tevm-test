'use client'

import * as React from 'react'
import { getAddress, hexToBytes, isAddress, isAddressEqual, isHex, trim } from 'viem'

type MatcherId = 'toBeAddress' | 'toBeHex' | 'toEqualAddress' | 'toEqualHex'

type Result = {
	pass: boolean
	message: string
}

const matchers: Record<MatcherId, { label: string; expected: boolean; description: string }> = {
	toBeAddress: {
		label: 'toBeAddress',
		expected: false,
		description: 'Asserts a value is a valid Ethereum address (EIP-55 checksummed by default)',
	},
	toBeHex: {
		label: 'toBeHex',
		expected: false,
		description: 'Asserts a value is a valid hex string, optionally of an exact byte size',
	},
	toEqualAddress: {
		label: 'toEqualAddress',
		expected: true,
		description: 'Asserts two addresses are equal, case-insensitively',
	},
	toEqualHex: {
		label: 'toEqualHex',
		expected: true,
		description: 'Asserts two hex strings are equal (leading zeros trimmed unless exact)',
	},
}

function equalsBytes(a: Uint8Array, b: Uint8Array) {
	if (a.length !== b.length) return false
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
	return true
}

function runToBeAddress(received: string, strict: boolean): Result {
	const pass = isAddress(received, { strict })
	const kind = strict ? 'valid Ethereum address (checksummed)' : 'valid Ethereum address'
	return {
		pass,
		message: pass ? `Expected ${received} not to be a ${kind}` : `Expected ${received} to be a ${kind}`,
	}
}

function runToBeHex(received: string, strict: boolean, size: number | undefined): Result {
	const isValidHex = isHex(received, { strict })
	const receivedSize = (received.length - 2) / 2
	const isValidSize = size === undefined || receivedSize === size
	const pass = isValidHex && isValidSize
	if (pass) return { pass, message: `Expected ${received} not to be a valid hex string` }
	if (!received.startsWith('0x')) return { pass, message: `Expected ${received} to start with "0x"` }
	if (!isValidHex)
		return { pass, message: `Expected ${received} to contain only hex characters (0-9, a-f, A-F) after "0x"` }
	return { pass, message: `Expected ${received} to have ${size} bytes, but got ${receivedSize} bytes` }
}

function runToEqualAddress(received: string, expected: string): Result {
	const isAddressReceived = isAddress(received, { strict: false })
	const isAddressExpected = isAddress(expected, { strict: false })
	if (!isAddressReceived) return { pass: false, message: `Expected ${received} to be a valid address` }
	if (!isAddressExpected) return { pass: false, message: `Expected ${expected} to be a valid address` }
	try {
		getAddress(received)
		getAddress(expected)
		const pass = isAddressEqual(received, expected)
		return { pass, message: pass ? 'Expected addresses not to be equal' : 'Expected addresses to be equal' }
	} catch {
		return { pass: false, message: 'Expected addresses to be equal' }
	}
}

function runToEqualHex(received: string, expected: string, exact: boolean): Result {
	if (!isHex(received, { strict: true })) return { pass: false, message: `Expected ${received} to be a valid hex string` }
	if (!isHex(expected, { strict: true })) return { pass: false, message: `Expected ${expected} to be a valid hex string` }
	let pass: boolean
	if (exact) {
		pass = received.toLowerCase() === expected.toLowerCase()
	} else {
		try {
			pass = equalsBytes(hexToBytes(trim(received)), hexToBytes(trim(expected)))
		} catch {
			pass = false
		}
	}
	return {
		pass,
		message: pass
			? 'Expected hex strings not to be equal'
			: `Expected hex strings to be equal${exact ? ' (exact match)' : ' (normalized comparison)'}`,
	}
}

const examples: Record<MatcherId, { received: string; expected: string }> = {
	toBeAddress: { received: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', expected: '' },
	toBeHex: { received: '0x1234abcd', expected: '' },
	toEqualAddress: {
		received: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
		expected: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
	},
	toEqualHex: { received: '0x00001234', expected: '0x1234' },
}

export function MatcherPlayground() {
	const [matcher, setMatcher] = React.useState<MatcherId>('toBeAddress')
	const [received, setReceived] = React.useState(examples.toBeAddress.received)
	const [expected, setExpected] = React.useState('')
	const [strict, setStrict] = React.useState(true)
	const [exact, setExact] = React.useState(false)
	const [size, setSize] = React.useState('')

	const needsExpected = matchers[matcher].expected

	const onMatcherChange = (id: MatcherId) => {
		setMatcher(id)
		setReceived(examples[id].received)
		setExpected(examples[id].expected)
	}

	const result = React.useMemo<Result>(() => {
		switch (matcher) {
			case 'toBeAddress':
				return runToBeAddress(received, strict)
			case 'toBeHex': {
				const parsed = Number.parseInt(size, 10)
				return runToBeHex(received, strict, Number.isNaN(parsed) || size.trim() === '' ? undefined : parsed)
			}
			case 'toEqualAddress':
				return runToEqualAddress(received, expected)
			case 'toEqualHex':
				return runToEqualHex(received, expected, exact)
		}
	}, [matcher, received, expected, strict, exact, size])

	const args =
		matcher === 'toBeAddress'
			? strict
				? ''
				: '{ strict: false }'
			: matcher === 'toBeHex'
				? size.trim()
					? `{ size: ${size.trim()} }`
					: ''
				: matcher === 'toEqualAddress'
					? `'${expected}'`
					: `'${expected}'${exact ? ', { exact: true }' : ''}`

	return (
		<div className="tevm-playground">
			<div className="tevm-playground-header">
				<span aria-hidden className="tevm-playground-dot" style={{ background: '#ff5f57' }} />
				<span aria-hidden className="tevm-playground-dot" style={{ background: '#febc2e' }} />
				<span aria-hidden className="tevm-playground-dot" style={{ background: '#28c840' }} />
				<span style={{ marginLeft: '0.5rem' }}>matcher playground — live, powered by @tevm/test-matchers logic</span>
			</div>
			<div className="tevm-playground-body">
				<div className="tevm-playground-row">
					<div className="tevm-playground-field" style={{ flex: '1 1 10rem' }}>
						<label className="tevm-playground-label" htmlFor="tevm-pg-matcher">
							Matcher
						</label>
						<select
							className="tevm-playground-select"
							id="tevm-pg-matcher"
							onChange={(e) => onMatcherChange(e.target.value as MatcherId)}
							value={matcher}
						>
							{Object.entries(matchers).map(([id, m]) => (
								<option key={id} value={id}>
									{m.label}
								</option>
							))}
						</select>
					</div>
					<div className="tevm-playground-field" style={{ flex: '2 1 16rem' }}>
						<label className="tevm-playground-label" htmlFor="tevm-pg-received">
							Received
						</label>
						<input
							className="tevm-playground-input"
							id="tevm-pg-received"
							onChange={(e) => setReceived(e.target.value)}
							spellCheck={false}
							value={received}
						/>
					</div>
					{needsExpected && (
						<div className="tevm-playground-field" style={{ flex: '2 1 16rem' }}>
							<label className="tevm-playground-label" htmlFor="tevm-pg-expected">
								Expected
							</label>
							<input
								className="tevm-playground-input"
								id="tevm-pg-expected"
								onChange={(e) => setExpected(e.target.value)}
								spellCheck={false}
								value={expected}
							/>
						</div>
					)}
				</div>

				<div className="tevm-playground-options">
					{(matcher === 'toBeAddress' || matcher === 'toBeHex') && (
						<label className="tevm-playground-checkbox">
							<input checked={strict} onChange={(e) => setStrict(e.target.checked)} type="checkbox" />
							strict
						</label>
					)}
					{matcher === 'toBeHex' && (
						<label className="tevm-playground-checkbox">
							size (bytes)
							<input
								className="tevm-playground-input"
								onChange={(e) => setSize(e.target.value)}
								placeholder="e.g. 32"
								style={{ width: '6rem', marginLeft: '0.25rem' }}
								value={size}
							/>
						</label>
					)}
					{matcher === 'toEqualHex' && (
						<label className="tevm-playground-checkbox">
							<input checked={exact} onChange={(e) => setExact(e.target.checked)} type="checkbox" />
							exact
						</label>
					)}
					<span style={{ fontSize: '0.8125rem', color: 'var(--text-color-muted)' }}>
						{matchers[matcher].description}
					</span>
				</div>

				<div className="tevm-playground-assertion">
					expect(<span>{JSON.stringify(received)}</span>).
					<span className="tevm-playground-matcher">{matchers[matcher].label}</span>({args})
				</div>

				<div className={result.pass ? 'tevm-playground-result tevm-playground-result-pass' : 'tevm-playground-result tevm-playground-result-fail'}>
					<span className="tevm-playground-badge">{result.pass ? 'PASS' : 'FAIL'}</span>
					<span className="tevm-playground-message">{result.message}</span>
				</div>
			</div>
		</div>
	)
}
