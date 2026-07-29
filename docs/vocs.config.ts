import { defineConfig } from 'vocs'

const tevmSites = [
	{ text: 'Tevm Node', link: 'https://node.tevm.sh' },
	{ text: 'Contract', link: 'https://contract.tevm.sh' },
	{ text: 'Utils', link: 'https://utils.tevm.sh' },
	{ text: 'Logger', link: 'https://logger.tevm.sh' },
	{ text: 'Test', link: 'https://test.tevm.sh' },
	{ text: 'Ethers', link: 'https://ethers.tevm.sh' },
	{ text: 'MUD', link: 'https://mud.tevm.sh' },
	{ text: 'CLI', link: 'https://cli.tevm.sh' },
	{ text: 'Bundler', link: 'https://bundler.tevm.sh' },
	{ text: 'Examples', link: 'https://examples.tevm.sh' },
] as const

export default defineConfig({
	title: 'Tevm Test',
	description:
		'Vitest matchers, an in-memory EVM test node, and test utilities for Ethereum TypeScript projects.',
	baseUrl: 'https://test.tevm.sh',
	accentColor: 'light-dark(#0588f0, #3b9eff)',
	colorScheme: 'light dark',
	iconUrl: '/tevm-logo.webp',
	logoUrl: {
		light: '/tevm-logo-light.png',
		dark: '/tevm-logo-dark.png',
	},
	checkDeadlinks: 'warn',
	editLink: {
		link: 'https://github.com/evmts/tevm-test/edit/main/docs/:path',
	},
	topNav: [
		{ text: 'Home', link: '/' },
		{ text: 'Ecosystem', items: tevmSites.map((s) => ({ ...s, external: true })) },
		{ text: 'GitHub', link: 'https://github.com/evmts/tevm-test', external: true },
	],
	socials: [
		{ icon: 'github', link: 'https://github.com/evmts/tevm-test' },
		{ icon: 'x', link: 'https://x.com/tevmtools' },
		{ icon: 'telegram', link: 'https://t.me/+ANThR9bHDLAwMjUx' },
	],
})
