import type { APIRoute } from 'astro';

import {
	getFreelanceTiles,
	getProjectTiles,
	getRepoTiles,
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

	const lines = [
		`# ${personalSchema.name}`,
		'',
		`> ${personalSchema.description}`,
		'',
		`${personalSchema.name} es desarrollador frontend en ${PROFILE.location.replace(', AR', ', Argentina')}.${PROFILE.isAvailable ? ' Está disponible para proyectos freelance.' : ''} Estudia ${new Intl.ListFormat('es').format(personalSchema.studies.map(({ program, school }) => `${program} en la ${school.name} (${school.alternateName})`))}.`,
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
		// llmstxt.org: links under "Optional" can be skipped for a shorter
		// context.
		'## Optional',
		'',
		link('Todos los proyectos', PROFILE.portfolioUrl),
		'',
	];

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
