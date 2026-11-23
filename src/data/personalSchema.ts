// Identity data shared by the JSON-LD, the meta tags and /llms.txt.
// Keep one canonical spelling of the name everywhere: search engines and
// AI answer engines match an entity by name, @id and sameAs.
export const SITE_URL = 'https://galeed.link';

export const personalSchema = {
	name: 'Galeed Gutierrez',
	alternateName: ['Galeed', 'Galeed Gutiérrez'],
	jobTitle: 'Frontend developer',
	description:
		'Desarrollador frontend en Jujuy, Argentina. Construye interfaces accesibles y rápidas con React, Astro y TypeScript, y las prueba con Vitest y Playwright.',
	address: {
		'@type': 'PostalAddress',
		addressRegion: 'Jujuy',
		addressCountry: 'AR',
	},
	education: [
		{
			'@type': 'CollegeOrUniversity',
			name: 'Universidad Nacional de Jujuy',
			alternateName: 'UNJu',
			url: 'https://www.unju.edu.ar',
		},
	],
	credentials: [
		{
			'@type': 'EducationalOccupationalCredential',
			name: 'Curso de Creación de Páginas Web con Astro',
			url: 'https://platzi.com/cursos/astro',
			recognizedBy: {
				'@type': 'EducationalOrganization',
				name: 'Platzi',
				url: 'https://platzi.com',
			},
		},
	],
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
		'Vite',
		'Accesibilidad web',
	],
	// galeed.dev is owned but has no content yet: add it to sameAs once it
	// is published, not before (an empty site weakens the identity match).
	socialLinks: {
		github: 'https://github.com/galeedgutierrez',
		linkedin: 'https://linkedin.com/in/galeedgutierrez',
		x: 'https://x.com/gutierrezgaleed',
		personalWebsite: 'https://galeedgutierrez.com',
	},
	xHandle: '@gutierrezgaleed',
	jobProfile: {
		'@type': 'Occupation',
		name: 'Desarrollador frontend',
		description:
			'Especializado en interfaces frontend modernas usando herramientas del ecosistema JavaScript.',
		occupationLocation: {
			'@type': 'Country',
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
