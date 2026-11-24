import type { CreativeWork } from 'schema-dts';

import type { RepoItem, TileItem } from '@/types/designTokens';

interface WorksInput {
	/** The `@id` of the page's Person node. */
	personId: string;
	/** Absolute origin used to resolve the screenshots' root-relative URLs. */
	siteUrl: string;
	tiles: TileItem[];
	freelance: TileItem[];
	repos: RepoItem[];
}

export type Work = CreativeWork & { '@id': string };

/**
 * Turns a card title into a URL fragment for the node's `@id`.
 * @param value - Card title.
 * @returns Lowercase ASCII words joined by hyphens.
 */
const slug = (value: string): string =>
	value
		.normalize('NFD')
		.replaceAll(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replaceAll(/[^a-z\d]+/g, '-')
		.replaceAll(/^-|-$/g, '');

/**
 * Resolves a tile's JSON-LD image against the site origin.
 * @param tile - A card model.
 * @param siteUrl - Absolute site origin.
 * @returns The absolute URL, or undefined when the tile has no image.
 */
const absoluteImage = (tile: TileItem, siteUrl: string): string | undefined =>
	tile.imageUrl ? new URL(tile.imageUrl, siteUrl).href : undefined;

/**
 * Turns the cards on the page into JSON-LD nodes for the ProfilePage graph.
 * Built from the card models, not from shared-assets, so the markup never
 * claims more than the page shows (Google's structured data guidelines).
 * Each node has its own `@id` (the ProfilePage lists them in `mentions`) and
 * points back to the Person by `@id`: `creator` for side projects,
 * `contributor` for client work, `author` for pull requests.
 * @param input - The Person's `@id`, the site origin and the card models.
 * @returns One node per card, in page order.
 */
export const buildWorksSchema = ({
	personId,
	siteUrl,
	tiles,
	freelance,
	repos,
}: WorksInput): Work[] => {
	const person = { '@id': personId };

	const sideProjects = tiles.map((tile): Work => ({
		'@type': 'CreativeWork',
		'@id': `${siteUrl}/#proyecto-${slug(tile.title)}`,
		name: tile.title,
		url: tile.href,
		description: tile.description,
		image: absoluteImage(tile, siteUrl),
		keywords: tile.technologies?.join(', '),
		dateCreated: tile.year ? String(tile.year) : undefined,
		creator: person,
	}));

	const clientWork = freelance.map((item): Work => ({
		'@type': 'CreativeWork',
		'@id': `${siteUrl}/#freelance-${slug(item.title)}`,
		name: item.title,
		// Private work has no public URL.
		url: item.href,
		description: item.description,
		image: absoluteImage(item, siteUrl),
		contributor: person,
	}));

	// The card links to a pull request (or to the repo when there is none).
	// The node is the contribution; the repository is what it is part of.
	const openSource = repos.map((repo): Work => ({
		'@type': 'CreativeWork',
		'@id': repo.href,
		// The PR title; a repo without a PR has its own description.
		name: repo.description || repo.repo,
		url: repo.href,
		image: absoluteImage(repo, siteUrl),
		author: person,
		isPartOf: {
			'@type': 'SoftwareSourceCode',
			name: repo.repo,
			codeRepository: repo.repositoryUrl,
			programmingLanguage: repo.language,
		},
	}));

	return [...clientWork, ...sideProjects, ...openSource];
};
