import { zambiaMapState } from '$lib/utils/state.svelte';
import { zambiaDataMap } from '$lib/utils/zambiademo/zambiaDataMap';
import { palettes } from '$lib/utils/colorPalettes';

export class ColorUtils {
	getHexColorExpression(metric = null) {
		metric = metric || zambiaMapState.selectedMetric;

		if (!metric || !zambiaDataMap[metric]) {
			console.warn('No valid metric for hex color expression:', metric);
			return null;
		}

		const data = zambiaDataMap[metric];
		const styleStops = data.data_info.style_stops;
		const dataName = data.meta_info.data_name;

		const colorScale = data.meta_info.color_scale;
		const reverse = data.meta_info.reverse_color_scale;
		const palette = reverse ? [...palettes[colorScale]].reverse() : palettes[colorScale];

		return [
			'interpolate',
			['linear'],
			['coalesce', ['to-number', ['get', dataName]], 0],
			styleStops[0],
			palette[0],
			styleStops[1],
			palette[1],
			styleStops[2],
			palette[2],
			styleStops[3],
			palette[3],
			styleStops[4],
			palette[4]
		];
	}
}
