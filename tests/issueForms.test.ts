import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

// The "Area" dropdown is copied into two issue forms, and issue-label.yml
// turns each pick into a label with a regex over the rendered issue body.
// Nothing else ties the files together: a renamed option would silently stop
// labeling issues.

const AREA_FORMS = ['bug_report', 'feature_request'];
const ALL_FORMS = [...AREA_FORMS, 'question'];
/** The option that maps to no label on purpose. */
const UNLABELED = 'Not sure';

interface IssueForm {
	labels?: string[];
	body: { id?: string; attributes?: { options?: string[] } }[];
}

/**
 * Reads a YAML file under `.github/`.
 * @param path - The path inside `.github/`.
 * @returns The parsed document.
 */
const readYaml = (path: string): unknown =>
	parse(
		// eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed paths below
		readFileSync(new URL(`../.github/${path}`, import.meta.url), 'utf8'),
	);

/**
 * Reads an issue form.
 * @param name - The file name, without `.yml`.
 * @returns The parsed form.
 */
const readForm = (name: string): IssueForm =>
	readYaml(`ISSUE_TEMPLATE/${name}.yml`) as IssueForm;

/**
 * Reads the options of a form's "Area" dropdown.
 * @param name - The form's file name, without `.yml`.
 * @returns The options, in order.
 */
const areaOptions = (name: string): string[] =>
	readForm(name).body.find(({ id }) => id === 'area')?.attributes?.options ??
	[];

/**
 * Turns an issue-labeler pattern (`/source/flags`) into a RegExp.
 * @param pattern - The pattern as issue-label.yml writes it.
 * @returns The compiled expression.
 */
const toRegExp = (pattern: string): RegExp => {
	const [, source = '', flags] = /^\/(.*)\/([a-z]*)$/su.exec(pattern) ?? [];

	// eslint-disable-next-line security/detect-non-literal-regexp -- patterns come from issue-label.yml
	return new RegExp(source, flags);
};

const ISSUE_LABELS = Object.entries(
	readYaml('issue-label.yml') as Record<string, string[]>,
).map(([label, patterns]) => ({
	label,
	patterns: patterns.map((pattern) => toRegExp(pattern)),
}));

/**
 * Builds an issue body the way a form renders the "Area" answer.
 * @param picks - The chosen options.
 * @returns The Markdown body.
 */
const render = (picks: string[]): string =>
	`### What happened?\n\nIt broke.\n\n### Area\n\n${picks.join(', ')}\n\n### Page\n\nHome (/)\n`;

/**
 * Lists the labels issue-label.yml gives a body.
 * @param body - An issue body.
 * @returns The matching label names.
 */
const labelsFor = (body: string): string[] =>
	ISSUE_LABELS.filter(({ patterns }) =>
		patterns.some((pattern) => pattern.test(body)),
	).map(({ label }) => label);

/**
 * Sorts names alphabetically.
 * @param names - Label names.
 * @returns A sorted copy.
 */
const sorted = (names: Iterable<string>): string[] =>
	[...names].toSorted((a, b) => a.localeCompare(b));

const OPTIONS = areaOptions(AREA_FORMS[0]);
const LABELED_OPTIONS = OPTIONS.filter((option) => option !== UNLABELED);

describe('issue forms', () => {
	it('offer "Not sure" in the "Area" dropdown', () => {
		expect(OPTIONS).toContain(UNLABELED);
	});

	it.each(AREA_FORMS)('%s shares the same "Area" options', (form) => {
		expect(areaOptions(form)).toStrictEqual(OPTIONS);
	});

	it.each(LABELED_OPTIONS)('give "%s" exactly one label', (option) => {
		expect(labelsFor(render([option]))).toHaveLength(1);
	});

	it('give "Not sure" no label', () => {
		expect(labelsFor(render([UNLABELED]))).toStrictEqual([]);
	});

	it('reach every label in issue-label.yml', () => {
		const reached = new Set(
			LABELED_OPTIONS.flatMap((option) => labelsFor(render([option]))),
		);

		expect(sorted(reached)).toStrictEqual(
			sorted(ISSUE_LABELS.map(({ label }) => label)),
		);
	});

	it('label every pick of a multiple choice', () => {
		expect(labelsFor(render(LABELED_OPTIONS))).toHaveLength(
			LABELED_OPTIONS.length,
		);
	});

	it('ignore an option named outside the "Area" answer', () => {
		const body = `### What happened?\n\nThe Content and the Performance look wrong.\n\n### Area\n\n${UNLABELED}\n`;

		expect(labelsFor(body)).toStrictEqual([]);
	});

	it('only use labels that labels.yml defines', () => {
		const defined = new Set(
			(readYaml('labels.yml') as { name: string }[]).map(
				({ name }) => name,
			),
		);
		const used = [
			...ISSUE_LABELS.map(({ label }) => label),
			...ALL_FORMS.flatMap((form) => readForm(form).labels ?? []),
		];

		expect(used.filter((label) => !defined.has(label))).toStrictEqual([]);
	});
});
