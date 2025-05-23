import { impactMapState } from '$lib/utils/state.svelte';
import { impactDataMap } from '$lib/utils/impactmap/impactDataMap';
import { palettes } from '$lib/utils/colorPalettes';

export class ColorUtils {
	getHexColorExpression(dataKey = null) {
		// Use provided dataKey or get from state
		dataKey = dataKey || impactMapState.dataMapKey;

		if (!dataKey || !impactDataMap[dataKey]) {
			console.warn('No valid data key for hex color expression:', dataKey);
			return null;
		}

		const data = impactDataMap[dataKey];
		const styleStops = data.data_info.style_stops;
		const dataName = data.meta_info.data_name;

		// Get appropriate palette
		const colorScale = data.meta_info.color_scale;
		const reverse = data.meta_info.reverse_color_scale;
		const palette = reverse ? [...palettes[colorScale]].reverse() : palettes[colorScale];

		const colorExpression = [
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

		console.log('Hex color expression:', colorExpression);
		console.log('Using data field:', dataName);
		console.log('Color expression using palette:', colorScale, 'reverse:', reverse);

		return colorExpression;
	}

	getRasterColorExpression(dataKey = null) {
		// Use provided dataKey or get from state
		dataKey = dataKey || impactMapState.dataMapKey;

		if (!dataKey || !impactDataMap[dataKey]) {
			console.warn('No valid data key for raster color expression:', dataKey);
			return null;
		}

		const data = impactDataMap[dataKey];

		const styleStops = this.float32To8Bit(
			data.data_info.style_stops,
			data.data_info.min,
			data.data_info.max
		);

		// Get appropriate palette
		const colorScale = data.meta_info.color_scale;
		const reverse = data.meta_info.reverse_color_scale;
		const palette = reverse ? [...palettes[colorScale]].reverse() : palettes[colorScale];

		console.log('Color expression using palette:', colorScale, 'reverse:', reverse);

		const colorExpression = [
			'interpolate',
			['linear'],
			['raster-value'],
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

		console.log('Raster color expression:', colorExpression);
		return colorExpression;
	}

	float32To8Bit(float32Array, min, max) {
		const uint8Array = new Uint8Array(float32Array.length);
		const scale = 255 / (max - min);

		for (let i = 0; i < float32Array.length; i++) {
			const transformed = (float32Array[i] - min) * scale;
			uint8Array[i] = Math.round(Math.max(0, Math.min(255, transformed)));

			// Ensure strictly ascending order
			if (i > 0 && uint8Array[i] <= uint8Array[i - 1]) {
				uint8Array[i] = uint8Array[i - 1] + 1;
			}
		}

		return uint8Array;
	}
}
