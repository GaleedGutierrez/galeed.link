// Identity data shared by the JSON-LD, the meta tags and /llms.txt. Studies
// and certificates come from shared-assets (`getStudies`, `getCourses` in hub.ts).
// Keep one canonical spelling of the name everywhere: search engines and
// AI answer engines match an entity by name, @id and sameAs.
export const SITE_URL = 'https://galeed.link';
/** The Person node's `@id`: the works on the page point back to it. */
export const PERSON_ID = `${SITE_URL}/#person`;
/** The WebSite node's `@id`: the ProfilePage is part of it. */
export const WEBSITE_ID = `${SITE_URL}/#website`;
/** First commit of the site, for the ProfilePage `dateCreated`. */
export const SITE_CREATED = '2025-07-13T21:59:58-03:00';

export const personalSchema = {
	name: 'Galeed Gutierrez',
	alternateName: ['Galeed', 'Galeed Gutiérrez'],
	jobTitle: 'Frontend developer',
	description:
		'Desarrollador frontend en Jujuy, Argentina. Construye interfaces accesibles y rápidas con React, Astro y TypeScript, y las prueba con Vitest y Playwright.',
	address: {
		'@type': 'PostalAddress' as const,
		addressRegion: 'Jujuy',
		addressCountry: 'AR',
	},
	skills: [
		'HTML',
		'CSS',
		'Tailwind CSS',
		'JavaScript',
		'TypeScript',
		'React',
		'Astro',
		'Vitest',
		'Playwright',
		'Node.js',
		'Accesibilidad web',
	],
	// galeed.dev is owned but has no content yet: add it to sameAs once it
	// is published, not before (an empty site weakens the identity match).
	socialLinks: {
		github: 'https://github.com/galeedgutierrez',
		linkedin: 'https://www.linkedin.com/in/galeedgutierrez',
		x: 'https://x.com/gutierrezgaleed',
		personalWebsite: 'https://galeedgutierrez.com',
		// Lists the Platzi certificates; the Formación section links to it.
		platzi: 'https://platzi.com/p/galeedgutierrez/',
	},
	xHandle: '@gutierrezgaleed',
	jobProfile: {
		'@type': 'Occupation' as const,
		name: 'Desarrollador frontend',
		description:
			'Especializado en interfaces frontend modernas usando herramientas del ecosistema JavaScript.',
		occupationLocation: {
			'@type': 'Country' as const,
			name: 'Argentina',
		},
		skills: [
			'Desarrollo con React',
			'Testing con Vitest y Playwright',
			'Maquetación con Astro y Tailwind',
			'Control de versiones con Git',
			'Transformación de ideas en productos reales',
		],
	},
};
