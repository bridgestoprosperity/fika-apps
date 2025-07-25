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
	let currentVizProps = $derived.by(() => {
		const selectedViz = saiMapState.selectedViz;
		let vizName = selectedViz;

		// Map visualization columns to their base property sets
		if (selectedViz.startsWith('travel_time_no_sites_')) {
			vizName = 'travel_time_no_sites';
		} else if (selectedViz.startsWith('travel_time_') && selectedViz !== 'travel_time') {
			vizName = 'travel_time';
		} else if (selectedViz.startsWith('time_delta_no_sites_')) {
			vizName = 'time_delta_no_sites';
		}

		// Return the visualization properties or default to population if not found
		return vizOptions[vizName] || vizOptions['population'];
	});

	let currentPalette = $derived.by(() => {
		const palette = palettes[saiMapState.selectedPalette] || defaultPalette;
		return saiMapState.reversePalette ? palette.slice().reverse() : palette;
	});

	$effect(() => {
		console.log(currentPalette);
	});

	async function initializeLayers() {
		if (!map) return;

		try {
			// Add hex6 source for zoom levels 0-6
			const hex6Url =
				'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/general-pmtiles/all_countries_merged_hex6.pmtiles';
			const hex6Header = await PmTilesSource.getHeader(hex6Url);
			const hex6Bounds = [
				hex6Header.minLon,
				hex6Header.minLat,
				hex6Header.maxLon,
				hex6Header.maxLat
			];

			map.addSource('sai-hex6', {
				type: PmTilesSource.SOURCE_TYPE,
				url: hex6Url,
				minzoom: hex6Header.minZoom,
				maxzoom: hex6Header.maxZoom,
				bounds: hex6Bounds
			});

			// Add hex8 source for zoom levels 7-22
			const hex8Url =
				'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/general-pmtiles/all_countries_merged_hex8.pmtiles';
			const hex8Header = await PmTilesSource.getHeader(hex8Url);
			const hex8Bounds = [
				hex8Header.minLon,
				hex8Header.minLat,
				hex8Header.maxLon,
				hex8Header.maxLat
			];

			map.addSource('sai-hex8', {
				type: PmTilesSource.SOURCE_TYPE,
				url: hex8Url,
				minzoom: 0,
				maxzoom: hex8Header.maxZoom,
				bounds: hex8Bounds
			});

			// Add hex6 fill layer with initial styling (for zoom 0-6)
			map.addLayer({
				id: 'sai-fill-hex6',
				type: 'fill',
				source: 'sai-hex6',
				'source-layer': 'hex6-impact-data',
				maxzoom: 7.5, // Only visible up to zoom level 6
				filter: ['has', saiMapState.selectedViz],
				paint: {
					'fill-color': [
						'interpolate',
						['linear'],
						['coalesce', ['to-number', ['get', saiMapState.selectedViz]], 0],
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

			// Add hex8 fill layer (for zoom 7-22)
			map.addLayer({
				id: 'sai-fill-hex8',
				type: 'fill',
				source: 'sai-hex8',
				'source-layer': 'hex8-impact-data',
				minzoom: 7.5, // Only visible from zoom level 7
				filter: ['has', saiMapState.selectedViz],
				paint: {
					'fill-color': [
						'interpolate',
						['linear'],
						['coalesce', ['to-number', ['get', saiMapState.selectedViz]], 0],
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

			// Add line layer for zero values (hex6)
			map.addLayer({
				id: 'sai-line-hex6',
				type: 'line',
				source: 'sai-hex6',
				'source-layer': 'hex6-impact-data',
				maxzoom: 7,
				filter: [
					'all',
					['has', saiMapState.selectedViz],
					['==', ['coalesce', ['to-number', ['get', saiMapState.selectedViz]], 0], 0]
				],
				minzoom: 6,
				paint: {
					'line-color': '#bdb7af',
					'line-width': ['interpolate', ['linear'], ['zoom'], 5.5, 0.1, 6, 0.5],
					'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 6, 1]
				}
			});

			// Add line layer for zero values (hex8)
			map.addLayer({
				id: 'sai-line-hex8',
				type: 'line',
				source: 'sai-hex8',
				'source-layer': 'hex8-impact-data',
				minzoom: 7,
				filter: [
					'all',
					['has', saiMapState.selectedViz],
					['==', ['coalesce', ['to-number', ['get', saiMapState.selectedViz]], 0], 0]
				],
				paint: {
					'line-color': '#bdb7af',
					'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.1, 12, 1],
					'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1]
				}
			});

			// Add click interaction for hex6
			map.on('click', 'sai-fill-hex6', (e) => {
				if (e.features.length > 0) {
					const properties = e.features[0].properties;
					console.log('Selected hex6 feature:', {
						[saiMapState.selectedViz]: properties[saiMapState.selectedViz],
						...properties
					});
					saiMapState.clickedData = {
						[saiMapState.selectedViz]: properties[saiMapState.selectedViz],
						...properties
					};
				}
			});

			// Add click interaction for hex8
			map.on('click', 'sai-fill-hex8', (e) => {
				if (e.features.length > 0) {
					const properties = e.features[0].properties;
					console.log('Selected hex8 feature:', {
						[saiMapState.selectedViz]: properties[saiMapState.selectedViz],
						...properties
					});
					saiMapState.clickedData = {
						[saiMapState.selectedViz]: properties[saiMapState.selectedViz],
						...properties
					};
				}
			});

			// Add hover effects
			map.on('mouseenter', 'sai-fill-hex6', () => {
				map.getCanvas().style.cursor = 'pointer';
			});

			map.on('mouseleave', 'sai-fill-hex6', () => {
				map.getCanvas().style.cursor = '';
			});

			map.on('mouseenter', 'sai-fill-hex8', () => {
				map.getCanvas().style.cursor = 'pointer';
			});

			map.on('mouseleave', 'sai-fill-hex8', () => {
				map.getCanvas().style.cursor = '';
			});
		} catch (error) {
			console.error('Error in initializeLayers:', error);
		}
	}

	// Effect to update the map style when visualization or palette changes
	$effect(() => {
		const selectedViz = saiMapState.selectedViz;

		// Handle property names for visualization options
		// For travel_time_* columns, use travel_time properties
		// For travel_time_no_sites_* columns, use travel_time_no_sites properties
		// For time_delta_no_sites_* columns, use time_delta_no_sites properties
		let vizName = selectedViz;
		if (selectedViz.startsWith('travel_time_no_sites_')) {
			vizName = 'travel_time_no_sites';
		} else if (selectedViz.startsWith('travel_time_') && selectedViz !== 'travel_time') {
			vizName = 'travel_time';
		} else if (selectedViz.startsWith('time_delta_no_sites_')) {
			vizName = 'time_delta_no_sites';
		}

		// Fall back to population if the viz isn't defined
		const vizProps = vizOptions[vizName] || vizOptions['population'];
		saiMapState.selectedPalette = vizProps.defaultPalette;
		saiMapState.reversePalette = vizProps.reversePalette;

		if (map) {
			try {
				// Update filters for both hex6 and hex8 layers
				if (map.getLayer('sai-fill-hex6')) {
					map.setFilter('sai-fill-hex6', ['has', selectedViz]);
					map.setFilter('sai-line-hex6', [
						'all',
						['has', selectedViz],
						['==', ['coalesce', ['to-number', ['get', selectedViz]], 0], 0]
					]);
				}

				if (map.getLayer('sai-fill-hex8')) {
					map.setFilter('sai-fill-hex8', ['has', selectedViz]);
					map.setFilter('sai-line-hex8', [
						'all',
						['has', selectedViz],
						['==', ['coalesce', ['to-number', ['get', selectedViz]], 0], 0]
					]);
				}

				// Update styles
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

		if (map) {
			try {
				if (map.getLayer('sai-fill-hex6') || map.getLayer('sai-fill-hex8')) {
					updateFillStyle();
				}
			} catch (error) {
				console.error('Error updating palette:', error);
			}
		}
	});

	// Helper function to update the fill style
	function updateFillStyle() {
		// Get the correct visualization properties based on the selected viz
		let vizName = saiMapState.selectedViz;
		if (vizName.startsWith('travel_time_no_sites_')) {
			vizName = 'travel_time_no_sites';
		} else if (vizName.startsWith('travel_time_') && vizName !== 'travel_time') {
			vizName = 'travel_time';
		} else if (vizName.startsWith('time_delta_no_sites_')) {
			vizName = 'time_delta_no_sites';
		}
		const vizProps = vizOptions[vizName] || vizOptions['population'];

		// Update hex6 layer if it exists
		if (map.getLayer('sai-fill-hex6')) {
			map.setPaintProperty('sai-fill-hex6', 'fill-color', [
				'interpolate',
				['linear'],
				// First convert string to number, then apply coalesce to handle null values
				['coalesce', ['to-number', ['get', saiMapState.selectedViz]], 0],
				vizProps['stop0'],
				currentPalette[0],
				vizProps['stop1'],
				currentPalette[1],
				vizProps['stop2'],
				currentPalette[2],
				vizProps['stop3'],
				currentPalette[3],
				vizProps['stop4'],
				currentPalette[4]
			]);
		}

		// Update hex8 layer if it exists
		if (map.getLayer('sai-fill-hex8')) {
			map.setPaintProperty('sai-fill-hex8', 'fill-color', [
				'interpolate',
				['linear'],
				// First convert string to number, then apply coalesce to handle null values
				['coalesce', ['to-number', ['get', saiMapState.selectedViz]], 0],
				vizProps['stop0'],
				currentPalette[0],
				vizProps['stop1'],
				currentPalette[1],
				vizProps['stop2'],
				currentPalette[2],
				vizProps['stop3'],
				currentPalette[3],
				vizProps['stop4'],
				currentPalette[4]
			]);
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
			const nav = new mapboxgl.NavigationControl({
				visualizePitch: true
			});
			map.addControl(nav, 'bottom-right');
			try {
				await initializeLayers();
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
	<div bind:this={mapContainer} class="absolute inset-0 h-full w-full"></div>
</div>
