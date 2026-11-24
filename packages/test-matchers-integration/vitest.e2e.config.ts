import { defineConfig } from 'vitest/config'

// End-to-end tests import the built `dist` output of every published package
// through its package.json `exports`, the same way a consumer would. Run
// `pnpm build` first.
export default defineConfig({
	test: {
		environment: 'node',
		include: ['e2e/**/*.e2e.spec.ts'],
		testTimeout: 120000,
	},
})
