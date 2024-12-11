<script>
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

	export const vectorWaternet = {
		id: 'vector-waternet',
		source: 'waterways-source',
		'source-layer': 'waterways',
		type: 'line',
		filter: [
			'all',
			['!=', ['get', 'intersects_lake'], true],
			['any', ['==', ['get', 'stream_order'], 1], ['>=', ['zoom'], 4]]
		],
		layout: {
			'line-join': 'round',
			'line-cap': 'round',
			visibility: $derived(waternetMapState.vectorData ? 'visible' : 'none')
		},
		paint: {
			'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.1, 12, 2],
			'line-color': $derived(
				waternetMapState.vectorStyle === 'Stream Order'
					? [
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
						]
					: ['case', ['==', ['get', 'from_tdx'], true], '#0C7BDC', '#FFCE00']
			)
		}
	};

	export const rasterWaternet = {
		id: 'raster-waternet',
		type: 'raster',
		source: {
			type: 'raster',
			tiles: ['https://public-b2p-geodata.s3.amazonaws.com/waternet-raster-tiles/{z}/{x}/{y}.png'],
			tileSize: 256
		},
		layout: {
			visibility: $derived(waternetMapState.rasterData ? 'visible' : 'none')
		},
		paint: $derived(
			waternetMapState.rasterData
				? {
						'raster-color': [
							'interpolate',
							['linear'],
							['raster-value'],
							38,
							palettes[waternetMapState.selectedPalette][0],
							64,
							palettes[waternetMapState.selectedPalette][1],
							128,
							palettes[waternetMapState.selectedPalette][2],
							192,
							palettes[waternetMapState.selectedPalette][3],
							217,
							palettes[waternetMapState.selectedPalette][4]
						],
						'raster-color-mix': [256, 0, 0, 0],
						'raster-color-range': [0, 256]
					}
				: {}
		)
	};

	export const satelliteImagery = {
		id: 'satellite-layer',
		type: 'raster',
		source: {
			type: 'raster',
			url: 'mapbox://mapbox.satellite',
			tileSize: 256
		},
		layout: {
			visibility: $derived(waternetMapState.satelliteImagery ? 'visible' : 'none')
		},
		paint: {
			'raster-saturation': $derived(waternetMapState.satStyle === 'Black and White' ? -1 : 0)
		}
	};
</script>
