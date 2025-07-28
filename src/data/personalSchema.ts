export const personalSchema = {
	name: 'Galeed Gutiérrez',
	alternateName: 'Galeed',
	education: [
		{
			'@type': 'CollegeOrUniversity',
			name: 'Universidad Nacional de Jujuy',
			alternateName: 'UNJu',
			'@id': 'https://www.unju.edu.ar',
			description:
				'Estudiante de la carrera Analista Programador Universitario...',
		},
		{
			'@type': 'EducationalOccupationalProgram',
			name: 'Curso de Creación de Páginas Web con Astro',
			'@id': 'https://platzi.com/cursos/astro',
			provider: {
				'@type': 'EducationalOrganization',
				name: 'Platzi',
				'@id': 'https://platzi.com',
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
	],
	socialLinks: {
		github: 'https://github.com/galeedgutierrez',
		linkedin: 'https://linkedin.com/in/galeedgutierrez',
		x: 'https://x.com/gutierrezgaleed',
		personalWebsite: 'https://galeedgutierrez.com',
		portfolio: 'https://galeed.dev',
	},
	jobProfile: {
		'@type': 'Occupation',
		'@id': 'https://galeed.link#occupation',
		name: 'Desarrollador Web',
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
	relatedProjects: [
		{
			'@type': 'CreativeWork',
			name: 'Linktree personal',
			url: 'https://galeed.link',
			description:
				'Sitio personal donde comparto mis redes, proyectos, colaboraciones open source y formación',
		},
		{
			'@type': 'CreativeWork',
			name: 'Proyectos personales',
			description:
				'Pequeñas herramientas web, componentes reutilizables, experimentos de UI/UX y miniapps.',
		},
		{
			'@type': 'CreativeWork',
			name: 'Proyectos freelance',
			description:
				'Desarrollo de sitios y aplicaciones web a medida para clientes con necesidades específicas',
		},
		{
			'@type': 'CreativeWork',
			name: 'Contribuciones open source',
			url: 'https://github.com/galeedgutierrez',
			description:
				'Colaboraciones en proyectos de código abierto con foco en el ecosistema JavaScript',
		},
	],
};
