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

/* Content models for the hub's sections (§7.8–§7.10) */
export interface SocialLink {
	label: string;
	href: string;
	icon: `simple-icons:${string}` | `lucide:${string}`;
}

export interface LinkItem {
	title: string;
	/** Without href the card renders as a static block (private work). */
	href?: string;
	meta?: string;
	status?: Status;
	chips?: string[];
	external?: boolean;
}

export interface TileItem {
	title: string;
	href: string;
	alt: string;
	image?: ImageMetadata;
	/** A smaller WebP of `image`, for the JSON-LD (root-relative). */
	imageUrl?: string;
	meta?: string;
	description?: string;
	featured?: boolean;
	/** The technologies and year shown in `meta`, for the JSON-LD. */
	technologies?: string[];
	year?: number;
}

export interface RepoItem {
	repo: `${string}/${string}`;
	href: string;
	description: string;
	chips: string[];
	status?: Status;
	/** The repository itself (href may point at a pull request), for the JSON-LD. */
	repositoryUrl?: string;
	language?: string;
}
