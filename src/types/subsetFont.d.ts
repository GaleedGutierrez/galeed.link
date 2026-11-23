// subset-font ships no types. Only the call scripts/subsetFonts.ts makes.
declare module 'subset-font' {
	interface SubsetFontOptions {
		targetFormat?: 'sfnt' | 'truetype' | 'woff' | 'woff2';
		preserveNameIds?: number[];
		variationAxes?: Record<string, number | { min: number; max: number }>;
	}

	export default function subsetFont(
		font: Buffer,
		text: string,
		options?: SubsetFontOptions,
	): Promise<Buffer>;
}
