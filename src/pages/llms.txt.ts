import type { APIRoute } from 'astro';

import {
	getCourses,
	getFreelanceTiles,
	getProjectTiles,
	getRepoTiles,
	getStudies,
	PROFILE,
	SOCIAL_LINKS,
} from '@/data/hub';
import { personalSchema, SITE_URL } from '@/data/personalSchema';
import { markdownLink as link, toMarkdownText } from '@/utils/markdown';

// /llms.txt (https://llmstxt.org): a Markdown summary for AI answer engines
// (GEO). Built from the same data as the page, so it never drifts from it.
// shared-assets text is escaped, so it can't add links or headings.

export const GET: APIRoute = async () => {
	const [freelance, projects, repos] = await Promise.all([
		getFreelanceTiles(),
		getProjectTiles(),
		getRepoTiles(),
	]);
	const studies = getStudies();
	const courses = getCourses();
	const current = studies
		.filter(({ isInProgress }) => isInProgress)
		.toSorted((a, b) => a.startDate.getTime() - b.startDate.getTime())
		.map(({ program, institution }) =>
			institution.alternateName
				? `${program} en la ${institution.name} (${institution.alternateName})`
				: `${program} en la ${institution.name}`,
		);

	const lines = [
		`# ${personalSchema.name}`,
		'',
		`> ${personalSchema.description}`,
		'',
		`${personalSchema.name} es desarrollador frontend en ${PROFILE.location.region}, ${PROFILE.location.country}.${PROFILE.isAvailable ? ' Está disponible para proyectos freelance.' : ''} Estudia ${toMarkdownText(new Intl.ListFormat('es').format(current))}.`,
		'',
		`Tecnologías: ${personalSchema.skills.join(', ')}.`,
		'',
		'## Perfil y contacto',
		'',
		link('Sitio (link hub)', `${SITE_URL}/`),
		link('Portfolio', PROFILE.portfolioUrl),
		...SOCIAL_LINKS.filter(({ href }) => href !== PROFILE.portfolioUrl).map(
			({ label, href }) => link(label, href),
		),
		link('Email', `mailto:${PROFILE.email}`),
		'',
		'## Trabajo freelance',
		'',
		...freelance.map(({ title, href, meta, status, description }) => {
			const details = [meta, status?.label].filter(Boolean).join(' · ');

			return href
				? link(
						title,
						href,
						[details, description].filter(Boolean).join('. '),
					)
				: `- ${toMarkdownText(`${title}: ${[`${details} · proyecto privado`, description].filter(Boolean).join('. ')}`)}`;
		}),
		'',
		'## Side projects recientes',
		'',
		...projects.map(({ title, href, meta, description }) =>
			link(title, href, [meta, description].filter(Boolean).join('. ')),
		),
		'',
		'## Open source',
		'',
		...repos.map(({ repo, href, description, status }) =>
			link(
				repo,
				href,
				[description, status?.label].filter(Boolean).join(' · '),
			),
		),
		'',
		'## Formación',
		'',
		...studies.map(({ title, institution, years, status }) =>
			institution.url
				? link(
						title,
						institution.url,
						`${institution.name} · ${years} · ${status.label}`,
					)
				: `- ${toMarkdownText(`${title}: ${institution.name} · ${years} · ${status.label}`)}`,
		),
		'',
		toMarkdownText(
			`Cursos recientes (${courses.total} certificados en ${new Intl.ListFormat('es').format(courses.platforms)}):`,
		),
		'',
		...courses.recent.map(({ title, href, platform, date }) => {
			const details = `${platform.name} · ${date.getFullYear()}`;

			return href
				? link(title, href, details)
				: `- ${toMarkdownText(`${title}: ${details}`)}`;
		}),
		'',
		// llmstxt.org: links under "Optional" can be skipped for a shorter
		// context.
		'## Optional',
		'',
		link('Todos los proyectos', PROFILE.portfolioUrl),
		link('Certificados de Platzi', PROFILE.platziUrl),
		'',
	];

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
