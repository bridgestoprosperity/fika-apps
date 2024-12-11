<script>
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import { onMount, onDestroy } from 'svelte';
	// Accept streamOrder as a prop that can be updated
	import { waternetMapState } from '$lib/state.svelte';
	// import { waternetMapLayers } from '$lib/waternetMapStyling.svelte';
	import { vectorWaternet, rasterWaternet, satelliteImagery } from '$lib/components/WaternetMapStyles.svelte';

	let map;
	let mapContainer;

	onMount(async () => {
		mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource);

		mapboxgl.accessToken =
			'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjajRpd2sxeGQwMjU5MnhxajJkNzZnODZtIn0.UrOwxq6A1Zl2yvwzYxBudQ';

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/bridgestoprosperity/cltoqnr9y01cg01oihr9d3yqh',
			// totally blank style
			// style: 'mapbox://styles/bridgestoprosperity/cm4hisquh002d01sx6b083yw0',
			center: [26.19, -0.21],
			zoom: 4,
			hash: true
		});

		map.on('load', async () => {
			const PMTILES_URL =
				'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/waternet-vector/waterway_model_outputs_20m_vector.pmtiles';

			const header = await PmTilesSource.getHeader(PMTILES_URL);
			const bounds = [header.minLon, header.minLat, header.maxLon, header.maxLat];
			console.log(header, bounds);
			map.addSource('waterways', {
				type: PmTilesSource.SOURCE_TYPE,
				url: PMTILES_URL,
				minzoom: header.minZoom,
				maxzoom: header.maxZoom,
				bounds: bounds
			});
			map.addLayer(vectorWaternet);
			map.addLayer(rasterWaternet);
			map.addLayer(satelliteImagery);

			map.on('mousemove', 'tdx', (e) => {
				map.getCanvas().style.cursor = 'crosshair';
				console.log(e.features[0].properties);
				waternetMapState.streamOrder = e.features[0].properties.stream_order;
				console.log(waternetMapState.streamOrder);
			});

			map.on('mouseleave', 'tdx', () => {
				map.getCanvas().style.cursor = '';
				waternetMapState.streamOrder = 0;
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
	<div bind:this={mapContainer} class="absolute inset-0 h-full w-full"></div>
</div>
