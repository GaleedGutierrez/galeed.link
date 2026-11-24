import type { ImageMetadata } from 'astro';
import { describe, expect, it } from 'vitest';

import { buildWorksSchema } from '@/data/worksSchema';

const PERSON_ID = 'https://galeed.link/#person';
const SITE_URL = 'https://galeed.link';

const image = {
	src: '/_astro/shop.abc123.png',
	width: 2560,
	height: 1600,
	format: 'png',
} as ImageMetadata;

type Node = Record<string, unknown>;

/**
 * Builds the nodes and serializes them the way the page does, so
 * `undefined` fields are dropped exactly as they are in the JSON-LD.
 * @param input - Overrides for the default empty input.
 * @returns The nodes as published.
 */
const build = (
	input: Partial<Parameters<typeof buildWorksSchema>[0]>,
): Node[] =>
	// eslint-disable-next-line unicorn/prefer-structured-clone -- the point is JSON serialization, not a clone
	JSON.parse(
		JSON.stringify(
			buildWorksSchema({
				personId: PERSON_ID,
				siteUrl: SITE_URL,
				tiles: [],
				freelance: [],
				repos: [],
				...input,
			}),
		),
	) as Node[];

describe('buildWorksSchema', () => {
	it('marks side projects as created by the Person, with an absolute image', () => {
		const [work] = build({
			tiles: [
				{
					title: 'Shop.co',
					href: 'https://shop.example/',
					alt: 'Captura de Shop.co',
					image,
					imageUrl: '/_astro/shop.abc123_Z1x.webp',
					description: 'E-commerce.',
					technologies: ['React', 'TypeScript'],
					year: 2025,
				},
			],
		});

		expect(work).toStrictEqual({
			'@type': 'CreativeWork',
			'@id': 'https://galeed.link/#proyecto-shop-co',
			name: 'Shop.co',
			url: 'https://shop.example/',
			description: 'E-commerce.',
			// The smaller WebP, never the full-size screenshot.
			image: 'https://galeed.link/_astro/shop.abc123_Z1x.webp',
			keywords: 'React, TypeScript',
			dateCreated: '2025',
			creator: { '@id': PERSON_ID },
		});
	});

	it('leaves the URL out of private client work', () => {
		const [work] = build({
			freelance: [{ title: 'Cliente privado', alt: '' }],
		});

		expect(work).toStrictEqual({
			'@type': 'CreativeWork',
			'@id': 'https://galeed.link/#freelance-cliente-privado',
			name: 'Cliente privado',
			contributor: { '@id': PERSON_ID },
		});
	});

	it('describes client work with the text and screenshot on its tile', () => {
		const [work] = build({
			freelance: [
				{
					title: 'YouTube Downloader',
					alt: 'Captura de YouTube Downloader',
					image,
					imageUrl: '/_astro/yt.abc123_Z1x.webp',
					description: 'Descarga videos.',
				},
			],
		});

		expect(work).toMatchObject({
			description: 'Descarga videos.',
			image: 'https://galeed.link/_astro/yt.abc123_Z1x.webp',
		});
		expect(work).not.toHaveProperty('url');
	});

	it('models a pull request as part of its repository', () => {
		const [work] = build({
			repos: [
				{
					title: 'withastro/docs',
					alt: '',
					repo: 'withastro/docs',
					href: 'https://github.com/withastro/docs/pull/1',
					description: 'Fix a typo',
					chips: [
						'MDX',
						{ abbr: 'PR', title: 'Pull request', text: ' #1' },
					],
					repositoryUrl: 'https://github.com/withastro/docs',
					language: 'MDX',
				},
			],
		});

		expect(work).toStrictEqual({
			'@type': 'CreativeWork',
			'@id': 'https://github.com/withastro/docs/pull/1',
			name: 'Fix a typo',
			url: 'https://github.com/withastro/docs/pull/1',
			author: { '@id': PERSON_ID },
			isPartOf: {
				'@type': 'SoftwareSourceCode',
				name: 'withastro/docs',
				codeRepository: 'https://github.com/withastro/docs',
				programmingLanguage: 'MDX',
			},
		});
	});

	it('gives every node a fragment @id without accents or symbols', () => {
		const [work] = build({
			tiles: [
				{
					title: 'Diseño & Código',
					href: 'https://a.example/',
					alt: '',
				},
			],
		});

		expect(work['@id']).toBe('https://galeed.link/#proyecto-diseno-codigo');
	});

	it('follows the page order: freelance, side projects, open source', () => {
		const works = build({
			tiles: [{ title: 'Tile', href: 'https://a.example/', alt: '' }],
			freelance: [{ title: 'Client', alt: '' }],
			repos: [
				{
					title: 'a/b',
					alt: '',
					repo: 'a/b',
					href: 'https://github.com/a/b',
					description: '',
					chips: [],
				},
			],
		});

		expect(works.map(({ name }) => name)).toStrictEqual([
			'Client',
			'Tile',
			'a/b',
		]);
	});
});
