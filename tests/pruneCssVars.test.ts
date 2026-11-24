import { describe, expect, it } from 'vitest';

import { pruneCustomProperties } from '../scripts/pruneCssVars.ts';

describe('pruneCustomProperties', () => {
	it('removes properties nothing reads', () => {
		const { sheets, removed } = pruneCustomProperties(
			[':root{--used:red;--unused:blue}.a{color:var(--used)}'],
			'',
		);

		expect(sheets).toStrictEqual([
			':root{--used:red}.a{color:var(--used)}',
		]);
		expect(removed).toStrictEqual(['--unused']);
	});

	it('keeps a property another sheet reads', () => {
		const { sheets } = pruneCustomProperties(
			[':root{--token:1px}', '.a{margin:var(--token)}'],
			'',
		);

		expect(sheets[0]).toBe(':root{--token:1px}');
	});

	it('follows chains: kept only if something reads the end of it', () => {
		const { removed } = pruneCustomProperties(
			[
				':root{--base:1px;--alias:var(--base);--orphan-base:2px;--orphan:var(--orphan-base)}.a{margin:var(--alias)}',
			],
			'',
		);

		expect(removed).toStrictEqual(['--orphan-base', '--orphan']);
	});

	it('keeps properties a page or script mentions', () => {
		const { removed } = pruneCustomProperties(
			[':root{--from-style:1px;--from-script:2px}'],
			'<div style="margin:var(--from-style)"></div> el.style.getPropertyValue("--from-script")',
		);

		expect(removed).toStrictEqual([]);
	});

	it('reads properties inside nested rules and @media', () => {
		const { removed } = pruneCustomProperties(
			[
				':root{--z:10}.a{@media (width>=40em){&:hover{z-index:var(--z)}}}',
			],
			'',
		);

		expect(removed).toStrictEqual([]);
	});

	it('drops a rule left empty', () => {
		const { sheets } = pruneCustomProperties(
			['.a{--only:1}.b{color:red}'],
			'',
		);

		expect(sheets).toStrictEqual(['.b{color:red}']);
	});
});
