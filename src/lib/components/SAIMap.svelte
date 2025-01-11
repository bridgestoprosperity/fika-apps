<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import MapControls from '$lib/components/MapControls.svelte';
	// import { mapState } from '$lib/stores/mapStore.svelte';
	import { saiMapState } from '$lib/utils/state.svelte';
	// import {
	// 	createVectorLayer,
	// 	createRasterLayer,
	// 	createSatelliteLayer,
	// 	getVectorLineColor,
	// 	getRasterPaint
	// } from '$lib/utils/mapLayers.svelte';

	let map;
	let mapContainer;

	let palette = ["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"];

	function initializeLayers(pmtilesUrl, header, bounds) {
		if (!map) return;

		if (!map.getSource('sai')) {

			map.addSource('sai', {
				type: PmTilesSource.SOURCE_TYPE,
				url: pmtilesUrl,
				minzoom: header.minZoom,
				maxzoom: header.maxZoom,
				bounds: bounds
			});

			// Add the polygon layer
	
			map.addLayer({
				id: 'sai-fill',
				type: 'fill',
				source: 'sai',
				'source-layer': 'traveltimeroads', // Replace with your actual source layer name
				paint: {
					'fill-color': [
						'case',
						['==', ['get', 'travel_time_no_sites'], 0], // If travel time is 0
						'#000000', // Use black
						[
							'interpolate',
							['linear'],
							['get', 'travel_time_no_sites'],
							5,
							palette[0],
							10,
							palette[1],
							30,
							palette[2],
							45,
							palette[3],
							60,
							palette[4],
							90,
							palette[5]
						]
					],
					'fill-opacity': 0.7
				}
			});


			// Add hover interactions
			// let hoveredStateId = null;

			// map.on('mousemove', 'sai-fill', (e) => {
			// 	if (e.features.length > 0) {
			// 		if (hoveredStateId !== null) {
			// 			map.setFeatureState(
			// 				{ source: 'sai', id: hoveredStateId, sourceLayer: 'your_source_layer_name' },
			// 				{ hover: false }
			// 			);
			// 		}
			// 		hoveredStateId = e.features[0].id;
			// 		map.setFeatureState(
			// 			{ source: 'sai', id: hoveredStateId, sourceLayer: 'your_source_layer_name' },
			// 			{ hover: true }
			// 		);

			// 		// Update cursor
			// 		map.getCanvas().style.cursor = 'pointer';

			// 		// Optionally update state with feature properties
			// 		saiMapState.style.selectedFeature = e.features[0].properties;
			// 	}
			// });

			// map.on('mouseleave', 'sai-polygons', () => {
			// 	if (hoveredStateId !== null) {
			// 		map.setFeatureState(
			// 			{ source: 'sai', id: hoveredStateId, sourceLayer: 'your_source_layer_name' },
			// 			{ hover: false }
			// 		);
			// 	}
			// 	hoveredStateId = null;
			// 	map.getCanvas().style.cursor = '';
			// 	saiMapState.style.selectedFeature = null;
			// });
		}
	}

	onMount(() => {
		mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource);

		mapboxgl.accessToken =
			'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTVyaGcweGswYWpzMnhxMjRyZHhtMGh0In0.4YOL9xCKxxQ0u2wZ7AlNMg';
		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/bridgestoprosperity/cm5rdpyp800it01rd4zgy7l5t',
			center: [26.19, -0.21],
			zoom: 3,
			hash: true
		});

		map.on('load', async () => {
			try {
				const PMTILES_URL =
					'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/general-pmtiles/travel-time-roads.pmtiles';
				const header = await PmTilesSource.getHeader(PMTILES_URL);
				const bounds = [header.minLon, header.minLat, header.maxLon, header.maxLat];
				initializeLayers(PMTILES_URL, header, bounds);
			} catch (error) {
				console.error('Error initializing layers:', error);
			}
		});

		// on hover over wateways layer console log stream order
		// map.on('mousemove', 'vector-waternet', (e) => {
		// 	console.log(e.features[0].properties.stream_order);
		// 	// change mouse to cross hair
		// 	map.getCanvas().style.cursor = 'crosshair';
		// 	// update mapState.streamOrder
		// 	waternetMapState.style.streamOrderValue = e.features[0].properties.stream_order;
		// });
		// map.on('mouseleave', 'vector-waternet', () => {
		// 	waternetMapState.style.streamOrderValue = '';
		// 	map.getCanvas().style.cursor = '';
		// });
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
