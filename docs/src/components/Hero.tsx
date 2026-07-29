import { HomePage } from 'vocs'

export function Hero() {
	return (
		<div className="tevm-hero">
			<img alt="Tevm logo" className="tevm-hero-logo tevm-hero-logo-light" src="/tevm-logo-light.png" />
			<img alt="Tevm logo" className="tevm-hero-logo tevm-hero-logo-dark" src="/tevm-logo-dark.png" />
			<h1 className="tevm-hero-wordmark">
				Tevm <span className="tevm-hero-accent">Test</span>
			</h1>
			<p className="tevm-hero-tagline">
				Vitest matchers for the EVM, an in-memory test node, and test utilities — everything you need to test
				Ethereum TypeScript code without an external node.
			</p>
			<div className="tevm-hero-install">
				<HomePage.InstallPackage name="@tevm/test-matchers @tevm/test-node @tevm/test-utils" />
			</div>
			<div className="tevm-hero-buttons">
				<a className="tevm-button tevm-button-accent" href="#playground">
					Try the matcher playground
				</a>
				<a className="tevm-button" href="https://github.com/evmts/tevm-test" rel="noopener" target="_blank">
					GitHub
				</a>
			</div>
		</div>
	)
}
