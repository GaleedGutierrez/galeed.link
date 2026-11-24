import {
	type Certificate,
	certificates,
	type Education,
	education,
	type FreelanceProject,
	freelanceProjects,
	type OpenSourceProject,
	openSourceProjects,
	type PersonalProject,
	personalProjects,
} from '@galeedgutierrez/shared-assets';
import { getImage } from 'astro:assets';

import type {
	CourseItem,
	RepoItem,
	SocialLink,
	Status,
	StudyItem,
	TileItem,
} from '@/types/designTokens';
import { toSafeUrl } from '@/utils/safeUrl';

import { personalSchema } from './personalSchema';

/** Hub-wide facts. Edit here, not in components. */
export const PROFILE = {
	name: personalSchema.name,
	role: personalSchema.jobTitle,
	location: 'Jujuy, AR',
	isAvailable: true as boolean, // toggles the system bar and llms.txt
	email: 'galeedeveloper@gmail.com',
	portfolioUrl: personalSchema.socialLinks.personalWebsite,
	platziUrl: personalSchema.socialLinks.platzi,
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
		srSuffix: 'personal',
	},
];

const FEATURED_PROJECTS_COUNT = 5;
// Width of the screenshot each project's JSON-LD node links to.
const SCHEMA_IMAGE_WIDTH = 1280;

const yearRange = (start: Date, end?: Date): string => {
	const years = [start, end ?? start].map((date) => date.getFullYear());
	const from = Math.min(...years);
	const to = end ? Math.max(...years) : undefined;

	if (to === undefined) {
		return `${from}—hoy`;
	}

	return from === to ? String(from) : `${from}—${to}`;
};

const FREELANCE_STATUS: Record<FreelanceProject['status'], Status> = {
	completed: { label: 'Terminado', tone: 'success' },
	'in-progress': { label: 'En curso', tone: 'info' },
	'on-hold': { label: 'En pausa', tone: 'warning' },
};

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
		// Removing an emoji between a word and its comma left "Apeperia , una".
		.replaceAll(/ ([,.;:])/g, '$1')
		.trim();

type Screenshot = PersonalProject['screenshot'];

/**
 * Loads a project screenshot for a tile. The screenshot is a 2560px PNG of up
 * to ~1 MB, so the JSON-LD links a 1280px WebP instead.
 * @param screenshot - The project's lazy screenshot import.
 * @param title - The project title, for the alt text.
 * @returns The image for `<Picture>`, the JSON-LD URL and the alt text.
 */
const loadScreenshot = async (
	screenshot: Screenshot,
	title: string,
): Promise<Pick<TileItem, 'alt' | 'image' | 'imageUrl'>> => {
	const { default: image } = await screenshot;
	const schemaImage = await getImage({
		src: image,
		format: 'webp',
		width: SCHEMA_IMAGE_WIDTH,
	});

	return { alt: `Captura de ${title}`, image, imageUrl: schemaImage.src };
};

export const getFreelanceTiles = async (): Promise<TileItem[]> =>
	Promise.all(
		freelanceProjects.map(async (project, index): Promise<TileItem> => ({
			title: project.title,
			// Private work has no public URL: the tile is a static block.
			href: project.isPrivate ? undefined : toSafeUrl(project.demoUrl),
			...(await loadScreenshot(project.screenshot, project.title)),
			meta: `${yearRange(project.startDate, project.endDate)} · ${project.scope.myRole}`,
			description: toPlainText(project.description),
			status: FREELANCE_STATUS[project.status],
			chips: project.isPrivate ? ['Privado'] : undefined,
			featured: index === 0,
		})),
	);

const byDateDesc = (a: PersonalProject, b: PersonalProject): number =>
	b.date.getTime() - a.date.getTime();

/** A side project tile: always a link (projects without a URL are skipped). */
type ProjectTile = TileItem & { href: string };

export const getProjectTiles = async (): Promise<ProjectTile[]> => {
	// A tile is a link: projects without a safe URL are skipped.
	const latest = personalProjects
		.flatMap((project) => {
			const href = toSafeUrl(project.url);

			return href ? { project, href } : [];
		})
		.toSorted((a, b) => byDateDesc(a.project, b.project))
		.slice(0, FEATURED_PROJECTS_COUNT);

	return Promise.all(
		latest.map(async ({ project, href }, index): Promise<ProjectTile> => {
			const technologies = project.technologies
				.slice(0, 3)
				.map((technology) => technology.name);
			const year = project.date.getFullYear();

			return {
				title: project.title,
				href,
				...(await loadScreenshot(project.screenshot, project.title)),
				meta: `${technologies.join(' · ')} · ${year}`,
				description: toPlainText(project.description),
				featured: index === 0,
				technologies,
				year,
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

export const getRepoTiles = async (): Promise<RepoItem[]> => {
	const repos = openSourceProjects.flatMap((project) => {
		const contribution = project.contributions.at(0);
		const href =
			toSafeUrl(contribution?.url) ?? toSafeUrl(project.repository.url);

		// A repo tile is a link: skip entries without a safe URL.
		return href ? { project, contribution, href } : [];
	});

	return Promise.all(
		repos.map(
			async (
				{ project, contribution, href },
				index,
			): Promise<RepoItem> => {
				const { owner, name, url, language } = project.repository;
				const repo = `${owner}/${name}` as const;

				return {
					title: repo,
					isCode: true,
					repo,
					href,
					...(await loadScreenshot(
						project.screenshot,
						project.title,
					)),
					// The pull request title; a repo without one has its own description.
					description: toPlainText(
						contribution?.title ?? project.description,
					),
					chips: [
						language,
						...(contribution ? [`PR #${contribution.number}`] : []),
					],
					status: contribution
						? PR_STATUS[contribution.status]
						: undefined,
					featured: index === 0,
					repositoryUrl: toSafeUrl(url),
					language,
				};
			},
		),
	);
};

type ListedStatus = Exclude<Education['status'], 'unfinished'>;

const STUDY_STATUS: Record<ListedStatus, Status> = {
	'in-progress': { label: 'En curso', tone: 'info' },
	graduated: { label: 'Egresado', tone: 'success' },
};

/**
 * What shared-assets doesn't carry: the article each degree takes in prose and
 * the acronym its institution goes by. A study without an entry reads as its
 * bare title, with no acronym.
 */
const STUDY_DETAILS = new Map([
	[
		'unju-analista-programador-universitario',
		{ article: 'la carrera de', alternateName: 'UNJu' },
	],
	['undec-ciencia-de-datos', { article: 'la', alternateName: 'UNdeC' }],
]);

const isListed = (
	study: Education,
): study is Education & { status: ListedStatus } =>
	study.status !== 'unfinished';

/**
 * The degrees in progress and the schools graduated from, newest first. A
 * school left after its first year isn't listed: it gave no degree.
 * @returns The Formación section's studies.
 */
export const getStudies = (): StudyItem[] =>
	education.filter(isListed).map((study): StudyItem => {
		const details = STUDY_DETAILS.get(study.id);

		return {
			title: study.title,
			institution: {
				name: study.institution.name,
				alternateName: details?.alternateName,
				url: toSafeUrl(study.institution.url),
			},
			isUniversity: study.level === 'university',
			isInProgress: study.status === 'in-progress',
			years: yearRange(study.startDate, study.endDate),
			status: STUDY_STATUS[study.status],
			program: details
				? `${details.article} ${study.title}`
				: study.title,
			startDate: study.startDate,
		};
	});

const RECENT_COURSES_COUNT = 5;

const toCourse = (certificate: Certificate): CourseItem => ({
	title: certificate.title,
	href: toSafeUrl(certificate.url),
	platform: {
		name: certificate.platform.name,
		url: certificate.platform.url,
	},
	date: certificate.date,
	credentialId: certificate.credentialId,
});

/**
 * The latest course certificates and a tally of all of them. Learning paths
 * and programs count in the tally but aren't listed as courses.
 * @returns The recent courses, the certificate count and the platforms that
 * issued them, the one with most certificates first.
 */
export const getCourses = (): {
	recent: CourseItem[];
	total: number;
	platforms: string[];
} => {
	const counts = new Map<string, number>();

	for (const { platform } of certificates) {
		counts.set(platform.name, (counts.get(platform.name) ?? 0) + 1);
	}

	return {
		recent: certificates
			.filter(({ kind }) => kind === 'course')
			.toSorted((a, b) => b.date.getTime() - a.date.getTime())
			.slice(0, RECENT_COURSES_COUNT)
			.map((certificate) => toCourse(certificate)),
		total: certificates.length,
		platforms: counts
			.entries()
			.toArray()
			.toSorted(([, a], [, b]) => b - a)
			.map(([name]) => name),
	};
};
