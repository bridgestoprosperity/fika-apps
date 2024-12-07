<script>
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import { onMount, onDestroy } from 'svelte';
	let streamOrder = $state(0);

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

	let map;
	let mapContainer;

	onMount(async () => {
		mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource);

		mapboxgl.accessToken =
			'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjajRpd2sxeGQwMjU5MnhxajJkNzZnODZtIn0.UrOwxq6A1Zl2yvwzYxBudQ';

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/bridgestoprosperity/cltoqnr9y01cg01oihr9d3yqh',
			center: [26.19, -0.21],
			zoom: 4,
			hash: true
		});

		map.on('load', async () => {
			const PMTILES_URL =
				'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/waternet-vector/waterway_model_outputs_20m_vector.pmtiles';

			const header = await PmTilesSource.getHeader(PMTILES_URL);
			const bounds = [header.minLon, header.minLat, header.maxLon, header.maxLat];
			console.log(header, bounds)
			map.addSource('waterways', {
				type: PmTilesSource.SOURCE_TYPE,
				url: PMTILES_URL,
				minzoom: header.minZoom,
				maxzoom: header.maxZoom,
				bounds: bounds
			});
			map.addLayer({
				id: 'waterways-layer',
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
			});

			map.on('mousemove', 'waterways-layer', (e) => {
				map.getCanvas().style.cursor = 'crosshair';
				streamOrder = e.features[0].properties.stream_order;
			});

			map.on('mouseleave', 'waterways-layer', () => {
				map.getCanvas().style.cursor = '';
				streamOrder = 0;
			});
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={mapContainer} class="absolute inset-0 h-full w-full" />
</div>
