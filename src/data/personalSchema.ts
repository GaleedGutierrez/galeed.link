// Identity data shared by the JSON-LD, the meta tags and /llms.txt.
// Keep one canonical spelling of the name everywhere: search engines and
// AI answer engines match an entity by name, @id and sameAs.
export const SITE_URL = 'https://galeed.link';
/** The Person node's `@id`: the works on the page point back to it. */
export const PERSON_ID = `${SITE_URL}/#person`;

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
	// Current studies. The JSON-LD lists the schools (alumniOf); /llms.txt
	// also names the programs (as prose, with their article).
	studies: [
		{
			program: 'la carrera de Analista Programador Universitario',
			school: {
				'@type': 'CollegeOrUniversity' as const,
				name: 'Universidad Nacional de Jujuy',
				alternateName: 'UNJu',
				url: 'https://www.unju.edu.ar',
			},
		},
		{
			program: 'la Tecnicatura en Ciencia de Datos',
			school: {
				'@type': 'CollegeOrUniversity' as const,
				name: 'Universidad Nacional de Chilecito',
				alternateName: 'UNdeC',
				url: 'https://www.undec.edu.ar',
			},
		},
	],
	credentials: [
		{
			'@type': 'EducationalOccupationalCredential' as const,
			name: 'Curso de Creación de Páginas Web con Astro',
			url: 'https://platzi.com/cursos/astro',
			recognizedBy: {
				'@type': 'EducationalOrganization' as const,
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
