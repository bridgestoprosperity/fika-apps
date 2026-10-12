// Paper sizes in millimetres (landscape = long edge horizontal).
const SIZES = {
	a4: { label: 'A4', long: 297, short: 210 },
	a3: { label: 'A3', long: 420, short: 297 },
	letter: { label: 'Letter (ANSI A)', long: 279.4, short: 215.9 }
};

const MM_PER_INCH = 25.4;

export const pageTemplates = Object.fromEntries(
	Object.entries(SIZES).flatMap(([id, s]) => [
		[
			`${id}-landscape`,
			{ label: `${s.label} Landscape`, widthMm: s.long, heightMm: s.short, marginMm: 10 }
		],
		[
			`${id}-portrait`,
			{ label: `${s.label} Portrait`, widthMm: s.short, heightMm: s.long, marginMm: 10 }
		]
	])
);

export const dpiOptions = [96, 150, 300];

// Page size in pixels at a given resolution.
export function pagePixels(templateKey, dpi) {
	const t = pageTemplates[templateKey];
	if (!t) return null;
	const toPx = (mm) => Math.round((mm / MM_PER_INCH) * dpi);
	return { width: toPx(t.widthMm), height: toPx(t.heightMm) };
}

// Printable size in inches, shown in the preview header (e.g. 11.7" x 8.3").
export function pageInches(templateKey) {
	const t = pageTemplates[templateKey];
	if (!t) return null;
	return {
		width: +(t.widthMm / MM_PER_INCH).toFixed(1),
		height: +(t.heightMm / MM_PER_INCH).toFixed(1)
	};
}
