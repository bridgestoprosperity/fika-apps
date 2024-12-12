<script>
	import { waternetMapState } from './state.svelte';
	import { palettes } from './colorPalettes';

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
							palettes.palettes.violetocean[0],
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
