import type { CreativeWork, SoftwareSourceCode } from 'schema-dts';

import type { LinkItem, RepoItem, TileItem } from '@/types/designTokens';

interface WorksInput {
	/** The `@id` of the page's Person node. */
	personId: string;
	/** Absolute origin used to resolve the screenshots' root-relative URLs. */
	siteUrl: string;
	tiles: TileItem[];
	freelance: LinkItem[];
	repos: RepoItem[];
}

export type Work = CreativeWork | SoftwareSourceCode;

/**
 * Turns the cards on the page into JSON-LD nodes for the ProfilePage graph.
 * Built from the card models, not from shared-assets, so the markup never
 * claims more than the page shows (Google's structured data guidelines).
 * Each node points back to the Person by `@id`: `creator` for side projects,
 * `contributor` for client work and pull requests to other people's repos.
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

	const sideProjects = tiles.map((tile): CreativeWork => ({
		'@type': 'CreativeWork',
		name: tile.title,
		url: tile.href,
		description: tile.description,
		image: tile.image ? new URL(tile.image.src, siteUrl).href : undefined,
		keywords: tile.technologies?.join(', '),
		dateCreated: tile.year ? String(tile.year) : undefined,
		creator: person,
	}));

	const clientWork = freelance.map((item): CreativeWork => ({
		'@type': 'CreativeWork',
		name: item.title,
		// Private work has no public URL.
		url: item.href,
		contributor: person,
	}));

	const openSource = repos.map((repo): SoftwareSourceCode => ({
		'@type': 'SoftwareSourceCode',
		name: repo.repo,
		description: repo.description,
		codeRepository: repo.repositoryUrl,
		programmingLanguage: repo.language,
		contributor: person,
	}));

	return [...clientWork, ...sideProjects, ...openSource];
};
