import {
	type FreelanceProject,
	freelanceProjects,
	type OpenSourceProject,
	openSourceProjects,
	type PersonalProject,
	personalProjects,
} from '@galeedgutierrez/shared-assets';
import type { ImageMetadata } from 'astro';

import type {
	LinkItem,
	RepoItem,
	SocialLink,
	Status,
	TileItem,
} from '@/types/designTokens';

import { personalSchema } from './personalSchema';

/** Hub-wide facts. Edit here, not in components. */
export const PROFILE = {
	name: 'Galeed Gutierrez',
	role: 'Frontend developer',
	location: 'Jujuy, AR',
	isAvailable: true,
	email: 'galeedeveloper@gmail.com',
	portfolioUrl: personalSchema.socialLinks.personalWebsite,
} as const;

export const SOCIAL_LINKS: SocialLink[] = [
	{
		href: personalSchema.socialLinks.linkedin,
		icon: 'simple-icons:linkedin',
		label: 'LinkedIn',
	},
	{ href: personalSchema.socialLinks.x, icon: 'simple-icons:x', label: 'X' },
	{
		href: personalSchema.socialLinks.github,
		icon: 'simple-icons:github',
		label: 'GitHub',
	},
	{
		href: personalSchema.socialLinks.personalWebsite,
		icon: 'lucide:globe',
		label: 'Web',
	},
];

const FEATURED_PROJECTS_COUNT = 5;

const yearRange = (start: Date, end?: Date): string => {
	const years = [start, end ?? start].map((date) => date.getFullYear());
	const from = Math.min(...years);
	const to = end ? Math.max(...years) : undefined;

	if (to === undefined) {
		return `${from}—hoy`;
	}

	return from === to ? `${from}` : `${from}—${to}`;
};

const FREELANCE_STATUS: Record<FreelanceProject['status'], Status> = {
	completed: { label: 'Terminado', tone: 'success' },
	'in-progress': { label: 'En curso', tone: 'info' },
	'on-hold': { label: 'En pausa', tone: 'warning' },
};

const toUrl = (value?: string): string | undefined =>
	value && URL.canParse(value) ? value : undefined;

export const freelanceItems: LinkItem[] = freelanceProjects.map(
	(project): LinkItem => {
		const href = project.isPrivate ? undefined : toUrl(project.demoUrl);

		return {
			title: project.title,
			href,
			external: Boolean(href),
			meta: `${yearRange(project.startDate, project.endDate)} · ${project.scope.myRole}`,
			status: FREELANCE_STATUS[project.status],
			chips: project.isPrivate ? ['Privado'] : undefined,
		};
	},
);

/**
 * Some shared-assets descriptions embed decorative markup (an aria-hidden emoji
 * span). Drop hidden spans, then any remaining tags, so cards get plain text.
 * @param value - Description from shared-assets.
 * @returns The description as plain text.
 */
const toPlainText = (value: string): string =>
	value
		.replaceAll(/<span[^>]*aria-hidden="true"[^>]*>.*?<\/span>/g, '')
		.replaceAll(/<[^>]+>/g, '')
		.replaceAll(/\s+/g, ' ')
		.trim();

const byDateDesc = (a: PersonalProject, b: PersonalProject): number =>
	b.date.getTime() - a.date.getTime();

export const getProjectTiles = async (): Promise<TileItem[]> => {
	const latest = personalProjects
		.toSorted(byDateDesc)
		.slice(0, FEATURED_PROJECTS_COUNT);

	return Promise.all(
		latest.map(async (project, index): Promise<TileItem> => {
			const screenshot = (await project.screenshots.webp
				.large) as unknown as {
				default: ImageMetadata;
			};

			return {
				title: project.title,
				href: project.url,
				alt: `Captura de ${project.title}`,
				image: screenshot.default,
				meta: `${project.technologies.slice(0, 3).join(' · ')} · ${project.date.getFullYear()}`,
				description: toPlainText(project.description),
				featured: index === 0,
			};
		}),
	);
};

const PR_STATUS: Record<
	OpenSourceProject['contributions'][number]['status'],
	Status
> = {
	merged: { label: 'Fusionado', tone: 'success' },
	open: { label: 'Abierto', tone: 'info' },
	closed: { label: 'Cerrado', tone: 'danger' },
};

export const repoItems: RepoItem[] = openSourceProjects.map(
	(project): RepoItem => {
		const contribution = project.contributions.at(0);
		const { owner, name, url, language } = project.repository;

		return {
			repo: `${owner}/${name}`,
			href: contribution?.url ?? url,
			description: contribution?.title ?? project.description,
			chips: [
				language,
				...(contribution ? [`PR #${contribution.number}`] : []),
			],
			status: contribution ? PR_STATUS[contribution.status] : undefined,
		};
	},
);
