export type TevmSite = {
	name: string
	href: string
	description: string
}

export const tevmSites: readonly TevmSite[] = [
	{ name: 'Node', href: 'https://node.tevm.sh', description: 'In-memory EVM node for JavaScript' },
	{ name: 'Contract', href: 'https://contract.tevm.sh', description: 'Type-safe contract instances' },
	{ name: 'Utils', href: 'https://utils.tevm.sh', description: 'EVM utility functions' },
	{ name: 'Logger', href: 'https://logger.tevm.sh', description: 'Structured logging for Tevm' },
	{ name: 'Test', href: 'https://test.tevm.sh', description: 'Matchers, test node & test utils' },
	{ name: 'Ethers', href: 'https://ethers.tevm.sh', description: 'Ethers.js adapters' },
	{ name: 'MUD', href: 'https://mud.tevm.sh', description: 'MUD framework integration' },
	{ name: 'CLI', href: 'https://cli.tevm.sh', description: 'Tevm command line interface' },
	{ name: 'Bundler', href: 'https://bundler.tevm.sh', description: 'Import .sol files directly' },
	{ name: 'Examples', href: 'https://examples.tevm.sh', description: 'Example projects' },
] as const
