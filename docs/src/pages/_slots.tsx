import { TevmFamily } from '../components/TevmFamily.js'

export const OutlineFooter = undefined
export const SidebarHeader = undefined

export function Footer() {
	return (
		<div>
			<TevmFamily current="Test" />
			<p className="tevm-footer-note">
				MIT Licensed ·{' '}
				<a href="https://github.com/evmts/tevm-test" rel="noopener" target="_blank">
					evmts/tevm-test
				</a>{' '}
				· Part of the{' '}
				<a href="https://tevm.sh" rel="noopener" target="_blank">
					Tevm
				</a>{' '}
				ecosystem
			</p>
		</div>
	)
}
