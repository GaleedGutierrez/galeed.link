import { describe, expect, it } from 'vitest';

import { buildEducationSchema } from '@/data/educationSchema';
import type { CourseItem, StudyItem } from '@/types/designTokens';

const university: StudyItem = {
	title: 'Analista Programador Universitario',
	institution: {
		name: 'Universidad Nacional de Jujuy',
		alternateName: 'UNJu',
		url: 'https://www.unju.edu.ar/',
	},
	isUniversity: true,
	isInProgress: true,
	years: '2021—hoy',
	status: { label: 'En curso', tone: 'info' },
	program: 'la carrera de Analista Programador Universitario',
	startDate: new Date('2021-03-01T03:00:00.000Z'),
};

const school: StudyItem = {
	title: 'Técnico en Equipos e Instalaciones Electromecánicas',
	institution: { name: 'EET N.º 1' },
	isUniversity: false,
	isInProgress: false,
	years: '2015—2019',
	status: { label: 'Egresado', tone: 'success' },
	program: 'Técnico en Equipos e Instalaciones Electromecánicas',
	startDate: new Date('2015-04-01T03:00:00.000Z'),
};

const course: CourseItem = {
	title: 'Curso de Redes Informáticas de Internet',
	href: 'https://platzi.com/p/galeedgutierrez/curso/2225-course/diploma/detalle/',
	platform: { name: 'Platzi', url: 'https://platzi.com/' },
	date: new Date('2026-07-09T23:43:40.531Z'),
	credentialId: 'ccfbc54e-e5f3-4758-b8b5-35390fe36eba',
};

describe('buildEducationSchema', () => {
	const schema = buildEducationSchema({
		studies: [university, school],
		courses: [course],
	});

	it('lists studies in progress as affiliation, never as alumniOf', () => {
		expect(schema.affiliation).toStrictEqual([
			{
				'@type': 'CollegeOrUniversity',
				name: 'Universidad Nacional de Jujuy',
				alternateName: 'UNJu',
				url: 'https://www.unju.edu.ar/',
			},
		]);
	});

	it('lists a graduated technical school as a HighSchool alumniOf', () => {
		expect(schema.alumniOf).toStrictEqual([
			{
				'@type': 'HighSchool',
				name: 'EET N.º 1',
				alternateName: undefined,
				url: undefined,
			},
		]);
	});

	it('gives a credential for the degree obtained and each course', () => {
		expect(schema.hasCredential).toHaveLength(2);
		expect(schema.hasCredential.at(0)).toMatchObject({
			name: school.title,
			credentialCategory: 'diploma',
			recognizedBy: { '@type': 'HighSchool' },
		});
		expect(schema.hasCredential.at(1)).toStrictEqual({
			'@type': 'EducationalOccupationalCredential',
			name: course.title,
			credentialCategory: 'certificate',
			url: course.href,
			identifier: course.credentialId,
			dateCreated: '2026-07-09T23:43:40.531Z',
			recognizedBy: {
				'@type': 'EducationalOrganization',
				name: 'Platzi',
				url: 'https://platzi.com/',
			},
		});
	});

	it('gives no credential for a study in progress', () => {
		const names = schema.hasCredential.map(
			(credential) => (credential as { name: string }).name,
		);

		expect(names).not.toContain(university.title);
	});
});
