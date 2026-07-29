// Import from `vocs/config`, not `vocs`: the root entry pulls in the React component barrel,
// which needs the `~icons` virtual module and is not resolvable while loading the config.
import { defineConfig } from 'vocs/config'

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
	titleTemplate: '%s · Tevm Test',
	description: 'Vitest matchers, an in-memory EVM test node, and test utilities for Ethereum TypeScript projects.',
	baseUrl: 'https://test.tevm.sh',
	accentColor: 'light-dark(#0588f0, #3b9eff)',
	colorScheme: 'light dark',
	iconUrl: '/tevm-logo.webp',
	logoUrl: {
		light: '/tevm-logo-light.png',
		dark: '/tevm-logo-dark.png',
	},
	ogImageUrl: 'https://vocs.dev/api/og?logo=%logo&title=%title&description=%description',
	// Vercel serves the prerendered output; `full-static` emits HTML for every page.
	renderStrategy: 'full-static',
	checkDeadlinks: 'warn',
	editLink: {
		link: 'https://github.com/evmts/tevm-test/edit/main/docs/:path',
		text: 'Edit on GitHub',
	},
	topNav: [
		{ text: 'Home', link: '/' },
		{ text: 'Guides', link: '/getting-started', match: '/guides' },
		{ text: 'API', link: '/api/test-matchers', match: '/api' },
		{ text: 'Ecosystem', items: tevmSites.map((s) => ({ ...s })) },
		{ text: 'GitHub', link: 'https://github.com/evmts/tevm-test' },
	],
	socials: [
		{ icon: 'github', link: 'https://github.com/evmts/tevm-test' },
		{ icon: 'x', link: 'https://x.com/tevmtools' },
		{ icon: 'telegram', link: 'https://t.me/+ANThR9bHDLAwMjUx' },
	],
	sidebar: [
		{
			text: 'Introduction',
			collapsed: false,
			items: [
				{ text: 'Overview', link: '/' },
				{ text: 'Getting started', link: '/getting-started' },
				{ text: 'Relation to Tevm', link: '/relation-to-tevm' },
			],
		},
		{
			text: 'Guides',
			collapsed: false,
			items: [
				{ text: 'Events', link: '/guides/events' },
				{ text: 'Reverts and errors', link: '/guides/errors' },
				{ text: 'Balances', link: '/guides/balances' },
				{ text: 'Account state', link: '/guides/state' },
				{ text: 'Contract calls', link: '/guides/contract-calls' },
				{ text: 'Hex and address utilities', link: '/guides/utils' },
				{ text: 'Forked snapshot tests', link: '/guides/snapshot-testing' },
				{ text: 'Contract fixtures', link: '/guides/fixtures' },
			],
		},
		{
			text: 'API reference',
			collapsed: false,
			items: [
				{ text: '@tevm/test-matchers', link: '/api/test-matchers' },
				{ text: '@tevm/test-node', link: '/api/test-node' },
				{ text: '@tevm/test-utils', link: '/api/test-utils' },
			],
		},
	],
})
