import { tevmSites } from './tevm-sites.js'

export function TevmFamily({ current = 'Test' }: { current?: string }) {
	return (
		<nav aria-label="Tevm ecosystem" className="tevm-family">
			<p className="tevm-family-heading">The Tevm ecosystem</p>
			<ul className="tevm-family-grid">
				{tevmSites.map((site) => (
					<li key={site.name}>
						<a
							aria-current={site.name === current ? 'page' : undefined}
							className="tevm-family-link"
							href={site.href}
							rel={site.name === current ? undefined : 'noopener'}
							target={site.name === current ? undefined : '_blank'}
							title={site.description}
						>
							<span aria-hidden className="tevm-family-dot" />
							{site.name}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}
