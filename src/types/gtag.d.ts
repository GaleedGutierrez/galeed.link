// gtag lives in the Partytown worker; Partytown's `forward` config puts a stub
// on the main thread. It is missing when a blocker stops analytics.
// eslint-disable-next-line no-var -- only `var` declares a globalThis property
declare var gtag:
	| ((
			command: 'event',
			name: string,
			parameters: Record<string, boolean | number | string>,
	  ) => void)
	| undefined;
