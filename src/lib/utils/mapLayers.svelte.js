import { PmTilesSource } from 'mapbox-pmtiles';
import { waternetMapState } from '$lib/utils/state.svelte';
import { palettes } from '$lib/utils/colorPalettes';

export function createVectorLayer() {
	return {
		id: 'vector-waternet',
		source: 'waterways',
		'source-layer': 'waterways',
		type: 'line',
		maxzoom: 22,
		minzoom: 0,
		filter: [
			'all',
			['!=', ['get', 'intersects_lake'], true],
			['any', ['==', ['get', 'stream_order'], 1], ['>=', ['zoom'], 4]]
		],
		layout: {
			'line-join': 'round',
			'line-cap': 'round',
			visibility: waternetMapState.visibility.vectorData ? 'visible' : 'none'
		},
		paint: {
			'line-width': [
				'interpolate',
				['linear'],
				['zoom'],
				6,
				[
					'match',
					['get', 'stream_order'],
					[2],
					0.02,
					[3],
					0.03,
					[4],
					0.04,
					[5],
					0.05,
					[6],
					0.06,
					[7],
					0.07,
					[8],
					0.08,
					0.01
				],
				8,
				[
					'match',
					['get', 'stream_order'],
					[1],
					0.1,
					[2],
					0.2,
					[3],
					0.3,
					[4],
					0.4,
					[5],
					0.5,
					[6],
					0.6,
					[7],
					0.7,
					[8],
					0.8,
					1
				],
				12,
				[
					'match',
					['get', 'stream_order'],
					[1],
					1,
					[2],
					2,
					[3],
					3,
					[4],
					4,
					[5],
					5,
					[6],
					6,
					[7],
					7,
					[8],
					8,
					9
				],
				16,
				[
					'match',
					['get', 'stream_order'],
					[1],
					2,
					[2],
					4,
					[3],
					6,
					[4],
					8,
					[5],
					10,
					[6],
					12,
					[7],
					14,
					[8],
					16,
					18
				]
			],
			'line-color': getVectorLineColor()
		}
	};
}

export function createRasterLayer() {
	return {
		id: 'raster-waternet',
		type: 'raster',
		source: {
			type: 'raster',
			tiles: ['https://public-b2p-geodata.s3.amazonaws.com/waternet-raster-tiles/{z}/{x}/{y}.png'],
			tileSize: 256,
			maxzoom: 10
		},
		layout: {
			visibility: waternetMapState.visibility.rasterData ? 'visible' : 'none'
		},
		paint: getRasterPaint()
	};
}

export function createSatelliteLayer() {
	return {
		id: 'satellite-layer',
		type: 'raster',
		source: {
			type: 'raster',
			url: 'mapbox://mapbox.satellite',
			tileSize: 256
		},
		layout: {
			visibility: waternetMapState.visibility.satelliteImagery ? 'visible' : 'none'
		},
		paint: {
			'raster-saturation': waternetMapState.style.satStyle === 'Black and White' ? -1 : 0
		}
	};
}

export function getVectorLineColor() {
	return waternetMapState.style.vectorStyle === 'Stream Order'
		? [
				'match',
				['get', 'stream_order'],
				[0],
				palettes.violetocean[0],
				[1],
				palettes.violetocean[1],
				[2],
				palettes.violetocean[2],
				[3],
				palettes.violetocean[3],
				[4],
				palettes.violetocean[4],
				[5],
				palettes.violetocean[5],
				[6],
				palettes.violetocean[6],
				[7],
				palettes.violetocean[7],
				[8],
				palettes.violetocean[8],
				palettes.violetocean[9]
			]
		: ['case', ['==', ['get', 'from_tdx'], true], '#0C7BDC', '#FFCE00'];
}

export function getRasterPaint() {
	return waternetMapState.style.selectedPalette
		? {
				'raster-color': [
					'interpolate',
					['linear'],
					['raster-value'],
					38,
					palettes[waternetMapState.style.selectedPalette][0],
					64,
					palettes[waternetMapState.style.selectedPalette][1],
					128,
					palettes[waternetMapState.style.selectedPalette][2],
					192,
					palettes[waternetMapState.style.selectedPalette][3],
					217,
					palettes[waternetMapState.style.selectedPalette][4]
				],
				'raster-color-mix': [256, 0, 0, 0],
				'raster-color-range': [0, 256]
			}
		: {};
}
