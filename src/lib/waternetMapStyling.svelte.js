// this should be three layers with different styling applied to each for max performance (vectorWaternet, rasterWaternet, and satelliteImagery)
import { waternetMapState } from './state.svelte';
import { palettes } from './colorPalettes';
const violetOcean = [
	'#93ECDD',
	'#7DD6E0',
	'#6DC0DE',
	'#66A9DA',
	'#5493D9',
	'#507CD4',
	'#5E60C7',
	'#6043C0',
	'#6A11B1',
	'#9F237E'
];

export let waternetMapLayers = {
	streamOrder: {
		id: 'streamOrder',
		source: 'waterways',
		'source-layer': 'waterways',
		type: 'line',
		filter: [
			'all',
			['!=', ['get', 'intersects_lake'], true],
			[
				'any',
				['all', ['>=', ['zoom'], 8], ['==', ['get', 'stream_order'], 1]],
				['all', ['>=', ['zoom'], 6], ['==', ['get', 'stream_order'], 2]],
				['all', ['>=', ['zoom'], 5], ['==', ['get', 'stream_order'], 3]],
				['all', ['>=', ['zoom'], 4], ['==', ['get', 'stream_order'], 4]],
				['all', ['>=', ['zoom'], 0], ['==', ['get', 'stream_order'], 5]],
				['all', ['>=', ['zoom'], 0], ['==', ['get', 'stream_order'], 6]],
				['all', ['>=', ['zoom'], 0], ['==', ['get', 'stream_order'], 7]],
				['all', ['>=', ['zoom'], 0], ['>=', ['get', 'stream_order'], 8]]
			]
		],
		layout: {
			visibility: 'visible',
			'line-join': 'round',
			'line-cap': 'round'
		},
		paint: {
			'line-color': [
				'match',
				['get', 'stream_order'],
				[0],
				violetOcean[0],
				[1],
				violetOcean[1],
				[2],
				violetOcean[2],
				[3],
				violetOcean[3],
				[4],
				violetOcean[4],
				[5],
				violetOcean[5],
				[6],
				violetOcean[6],
				[7],
				violetOcean[7],
				[8],
				violetOcean[8],
				violetOcean[9]
			],
			'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.1, 8, 0.5, 12, 2, 16, 4]
		}
	},
	tdx: {
		id: 'tdx',
		source: 'waterways',
		'source-layer': 'waterways',
		type: 'line',
		filter: [
			'all',
			['!=', ['get', 'intersects_lake'], true],
			[
				'any',
				['all', ['>=', ['zoom'], 8], ['==', ['get', 'stream_order'], 1]],
				['all', ['>=', ['zoom'], 6], ['==', ['get', 'stream_order'], 2]],
				['all', ['>=', ['zoom'], 5], ['==', ['get', 'stream_order'], 3]],
				['all', ['>=', ['zoom'], 4], ['==', ['get', 'stream_order'], 4]],
				['all', ['>=', ['zoom'], 0], ['==', ['get', 'stream_order'], 5]],
				['all', ['>=', ['zoom'], 0], ['==', ['get', 'stream_order'], 6]],
				['all', ['>=', ['zoom'], 0], ['==', ['get', 'stream_order'], 7]],
				['all', ['>=', ['zoom'], 0], ['>=', ['get', 'stream_order'], 8]]
			]
		],
		layout: {
			visibility: 'visible',
			'line-join': 'round',
			'line-cap': 'round'
		},
		paint: {
			'line-color': [
				'case',
				['==', ['get', 'from_tdx'], true],
				'#0C7BDC', // green
				'#FFCE00' // red
			],
			'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.1, 8, 0.5, 12, 2, 16, 4]
		}
	},
	rasterWaternet: {
		id: 'raster-waternet',
		type: 'raster',
		source: {
			type: 'raster',
			tiles: ['https://public-b2p-geodata.s3.amazonaws.com/waternet-raster-tiles/{z}/{x}/{y}.png'],
			tileSize: 256,
			scheme: 'xyz',
			minzoom: 0,
			maxzoom: 10
		},
		paint: {
			'raster-color': [
				'interpolate',
				['linear'],
				['raster-value'],
				38,
				palettes.blues[0],
				64,
				palettes.blues[1],
				128,
				palettes.blues[2],
				192,
				palettes.blues[3],
				217,
				palettes.blues[4]
			],
			'raster-color-mix': [256, 0, 0, 0],
			'raster-color-range': [0, 256]
		}
	},
	satellite: {
		id: 'satellite-layer',
		type: 'raster',
		source: { type: 'raster', url: 'mapbox://mapbox.satellite', tileSize: 256, maxzoom: 22 },
		minzoom: 0,
		maxzoom: 22,
		layout: {
			visibility: 'visible'
		}
	}
};