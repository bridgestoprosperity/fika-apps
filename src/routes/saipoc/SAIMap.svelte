<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import { saiMapState } from '$lib/utils/state.svelte';
	import { vizOptions } from '$lib/utils/saiMapProperties';
	import { palettes } from '$lib/utils/colorPalettes';

	let map;
	let mapContainer;
	const defaultPalette = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];

	// Create derived values for the visualization
	let currentVizProps = $derived(vizOptions[saiMapState.selectedViz]);
	let currentPalette = $derived.by(() => {
		const palette = palettes[saiMapState.selectedPalette] || defaultPalette;
		return saiMapState.reversePalette ? palette.slice().reverse() : palette;
	});

	$effect(() => {
		console.log(currentPalette);
	});

	async function initializeLayers(pmtilesUrl, header, bounds) {
		if (!map) return;

		try {
			if (!map.getSource('sai')) {
				map.addSource('sai', {
					type: PmTilesSource.SOURCE_TYPE,
					url: pmtilesUrl,
					minzoom: header.minZoom,
					maxzoom: header.maxZoom,
					bounds: bounds
				});

				// Add fill layer with initial styling
				map.addLayer({
					id: 'sai-fill',
					type: 'fill',
					source: 'sai',
					'source-layer': 'traveltimeroads',
					filter: ['!=', ['get', saiMapState.selectedViz], 0],
					paint: {
						'fill-color': [
							'interpolate',
							['linear'],
							['get', saiMapState.selectedViz],
							currentVizProps['stop0'],
							currentPalette[0],
							currentVizProps['stop1'],
							currentPalette[1],
							currentVizProps['stop2'],
							currentPalette[2],
							currentVizProps['stop3'],
							currentPalette[3],
							currentVizProps['stop4'],
							currentPalette[4]
						],
						'fill-opacity': 0.7
					}
				});

				// Add line layer for zero values
				map.addLayer({
					id: 'sai-line',
					type: 'line',
					source: 'sai',
					'source-layer': 'traveltimeroads',
					filter: ['==', ['get', saiMapState.selectedViz], 0],
					minzoom: 8.5,
					paint: {
						'line-color': '#bdb7af',
						'line-width': ['interpolate', ['linear'], ['zoom'], 11.5, 0.1, 12, 1],
						'line-opacity': ['interpolate', ['linear'], ['zoom'], 8.5, 0, 9, 1]
					}
				});

				// Add click interaction
				map.on('click', 'sai-fill', (e) => {
					if (e.features.length > 0) {
						const properties = e.features[0].properties;
						console.log('Selected feature:', {
							[saiMapState.selectedViz]: properties[saiMapState.selectedViz],
							...properties
						});
						saiMapState.clickedData = {
							[saiMapState.selectedViz]: properties[saiMapState.selectedViz],
							...properties
						};
					}
				});

				// Add hover effect
				map.on('mouseenter', 'sai-fill', () => {
					map.getCanvas().style.cursor = 'pointer';
				});

				map.on('mouseleave', 'sai-fill', () => {
					map.getCanvas().style.cursor = '';
				});
			}
		} catch (error) {
			console.error('Error in initializeLayers:', error);
		}
	}

	// Effect to update the map style when visualization or palette changes
	$effect(() => {
		const selectedViz = saiMapState.selectedViz;

		saiMapState.selectedPalette = vizOptions[selectedViz].defaultPalette;
		saiMapState.reversePalette = vizOptions[selectedViz].reversePalette;

		if (map && map.getLayer('sai-fill')) {
			try {
				// Update the filters for both layers since they only depend on selectedViz
				map.setFilter('sai-fill', ['!=', ['get', selectedViz], 0]);
				map.setFilter('sai-line', ['==', ['get', selectedViz], 0]);

				// Update the visualization property in the fill style
				updateFillStyle();
			} catch (error) {
				console.error('Error updating visualization:', error);
			}
		}
	});

	// Effect for handling palette changes
	$effect(() => {
		const selectedPalette = saiMapState.selectedPalette;
		const reversePalette = saiMapState.reversePalette;

		if (map && map.getLayer('sai-fill')) {
			try {
				updateFillStyle();
			} catch (error) {
				console.error('Error updating palette:', error);
			}
		}
	});

	// Helper function to update the fill style
	function updateFillStyle() {
		map.setPaintProperty('sai-fill', 'fill-color', [
			'interpolate',
			['linear'],
			['get', saiMapState.selectedViz],
			currentVizProps['stop0'],
			currentPalette[0],
			currentVizProps['stop1'],
			currentPalette[1],
			currentVizProps['stop2'],
			currentPalette[2],
			currentVizProps['stop3'],
			currentPalette[3],
			currentVizProps['stop4'],
			currentPalette[4]
		]);
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
				await initializeLayers(PMTILES_URL, header, bounds);
			} catch (error) {
				console.error('Error in map load:', error);
			}
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={mapContainer} class="absolute inset-0 h-full w-full" ></div>
</div>
