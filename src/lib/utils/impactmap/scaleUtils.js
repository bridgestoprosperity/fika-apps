const INCH_IN_METERS = 0.0254;

// Ground metres per CSS pixel along the map's vertical centre line.
// Uses two real unprojected points, so it is correct at any zoom/latitude
// (valid for a north-up, un-pitched Mercator view).
export function metersPerPixel(map) {
	const y = map.getContainer().clientHeight / 2;
	const a = map.unproject([0, y]);
	const b = map.unproject([100, y]);
	return a.distanceTo(b) / 100;
}

// Scale denominator N for "1 : N" at a given resolution (96 = screen CSS pixels).
export function scaleDenominator(map, dpi = 96) {
	return Math.round((metersPerPixel(map) * dpi) / INCH_IN_METERS);
}

// Zoom level that produces 1 : targetN. Each zoom level halves metres per pixel.
export function zoomForScale(map, targetN, dpi = 96) {
	const targetMpp = (targetN * INCH_IN_METERS) / dpi;
	return map.getZoom() + Math.log2(metersPerPixel(map) / targetMpp);
}

// Closed-form Mercator metres per pixel (512px tiles), for cross-checking metersPerPixel.
export function metersPerPixelFormula(zoom, latitude) {
	return (78271.51696402048 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
}

// Rounded for display: scale is only exact at the frame centre, so avoid false precision.
export function formatScale(n) {
	if (!Number.isFinite(n) || n <= 0) return '';
	const digits = Math.floor(Math.log10(n)) + 1;
	const step = Math.pow(10, Math.max(digits - 3, 0));
	return `1:${(Math.round(n / step) * step).toLocaleString('en-US')}`;
}
