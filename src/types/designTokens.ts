import type { ImageMetadata } from 'astro';

/** Every semantic color application: declared once in settings/colors.css :root. */
export const COLOR_TOKENS = [
	'background-color-primary',
	'background-color-secondary',
	'background-color-tertiary',
	'background-color-accent',
	'background-color-hover-accent',
	'background-color-accent-subtle',
	'background-color-indicator',
	'background-color-inverse',
	'text-color-primary',
	'text-color-secondary',
	'text-color-tertiary',
	'text-color-accent',
	'text-color-hover-accent',
	'text-color-on-accent',
	'text-color-inverse',
	'text-color-success',
	'text-color-warning',
	'text-color-danger',
	'text-color-info',
	'border-color-primary',
	'border-color-strong',
	'border-color-accent',
	'border-color-hover-accent',
	'outline-color-focus',
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

/** Same value in both themes, so written without light-dark(). */
export const SHARED_COLOR_TOKENS = [
	'background-color-accent',
	'background-color-hover-accent',
	'border-color-accent',
] as const satisfies readonly ColorToken[];

export type StatusTone = 'success' | 'warning' | 'danger' | 'info';

export interface Status {
	label: string;
	tone: StatusTone;
}

/* Content models for the hub's sections (§7.8–§7.9) */
export interface SocialLink {
	label: string;
	/** Read after the label when the label alone doesn't say where the link goes (SC 2.4.9). */
	srSuffix?: string;
	href: string;
	icon: `simple-icons:${string}` | `lucide:${string}`;
}

export interface TileItem {
	title: string;
	/** Without href the tile renders as a static block (private work). */
	href?: string;
	alt: string;
	image?: ImageMetadata;
	/** A smaller WebP of `image`, for the JSON-LD (root-relative). */
	imageUrl?: string;
	meta?: string;
	description?: string;
	featured?: boolean;
	status?: Status;
	chips?: string[];
	/** Sets the title in the mono face (`owner/repo`). */
	isCode?: boolean;
	/** The technologies and year shown in `meta`, for the JSON-LD. */
	technologies?: string[];
	year?: number;
}

/** A degree or school in the Formación section. */
export interface StudyItem {
	title: string;
	institution: {
		name: string;
		/** The acronym the institution goes by (UNJu), for the JSON-LD. */
		alternateName?: string;
		url?: string;
	};
	isUniversity: boolean;
	isInProgress: boolean;
	/** `2021—hoy` or `2015—2019`. */
	years: string;
	status: Status;
	/** The degree with its article, for prose ("la carrera de …"). */
	program: string;
	startDate: Date;
}

/** A course certificate in the Formación section. */
export interface CourseItem {
	title: string;
	/** The public diploma page; without one the row is static. */
	href?: string;
	platform: { name: string; url: string };
	date: Date;
	credentialId?: string;
}

/** An open source tile: `title` is the `owner/repo`. */
export interface RepoItem extends TileItem {
	repo: `${string}/${string}`;
	href: string;
	description: string;
	chips: string[];
	/** The repository itself (href may point at a pull request), for the JSON-LD. */
	repositoryUrl?: string;
	language?: string;
}
