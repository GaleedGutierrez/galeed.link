import type {
	CollegeOrUniversity,
	EducationalOccupationalCredential,
	HighSchool,
} from 'schema-dts';

import type { CourseItem, StudyItem } from '@/types/designTokens';

interface EducationInput {
	studies: StudyItem[];
	/** The courses the page lists, not every certificate. */
	courses: CourseItem[];
}

export interface EducationSchema {
	affiliation: (CollegeOrUniversity | HighSchool)[];
	alumniOf: (CollegeOrUniversity | HighSchool)[];
	hasCredential: EducationalOccupationalCredential[];
}

/**
 * The institution as a JSON-LD node. A technical school is a secondary school.
 * @param study - A study model.
 * @returns The institution node.
 */
const institution = ({
	institution: { name, alternateName, url },
	isUniversity,
}: StudyItem): CollegeOrUniversity | HighSchool => ({
	'@type': isUniversity ? 'CollegeOrUniversity' : 'HighSchool',
	name,
	alternateName,
	url,
});

/**
 * The Person's education properties, built from the Formación section's
 * models so the markup never claims more than the page shows.
 * @param input - The studies and the courses on the page.
 * @returns `affiliation` for studies in progress (`alumniOf` means graduated
 * from), `alumniOf` for the schools graduated from, and `hasCredential` for
 * each degree obtained and each listed course.
 */
export const buildEducationSchema = ({
	studies,
	courses,
}: EducationInput): EducationSchema => {
	const current = studies.filter(({ isInProgress }) => isInProgress);
	const finished = studies.filter(({ isInProgress }) => !isInProgress);

	return {
		affiliation: current.map((study) => institution(study)),
		alumniOf: finished.map((study) => institution(study)),
		hasCredential: [
			...finished.map((study): EducationalOccupationalCredential => ({
				'@type': 'EducationalOccupationalCredential',
				name: study.title,
				credentialCategory: 'diploma',
				recognizedBy: institution(study),
			})),
			...courses.map((course): EducationalOccupationalCredential => ({
				'@type': 'EducationalOccupationalCredential',
				name: course.title,
				credentialCategory: 'certificate',
				url: course.href,
				identifier: course.credentialId,
				dateCreated: course.date.toISOString(),
				recognizedBy: {
					'@type': 'EducationalOrganization',
					name: course.platform.name,
					url: course.platform.url,
				},
			})),
		],
	};
};
