<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import { impactMapState } from '$lib/utils/state.svelte';
	import { impactDataMap } from '$lib/utils/impactDataMap';
	import { palettes } from '$lib/utils/colorPalettes';

	let map;
	let mapContainer;

	// Get the current palette explicitly, NOT using $derived
	function getPalette() {
		const dataKey = impactMapState.dataMapKey;
		if (!dataKey || !impactDataMap[dataKey]) return palettes.viridis;
		
		const colorScale = impactDataMap[dataKey].meta_info.color_scale;
		const reverse = impactDataMap[dataKey].meta_info.reverse_color_scale;
		
		if (reverse) {
			return [...palettes[colorScale]].reverse();
		} else {
			return palettes[colorScale];
		}
	}
	
	// Create the reactive variable using the function
	let currentPalette = getPalette();
	
	// Log the actual palette array
	console.log('colorScale', impactDataMap[impactMapState.dataMapKey].meta_info.color_scale);
	console.log('currentPalette', currentPalette);

	// Function to update the map palette when data key changes
	function updateMapPalette() {
		if (!map || !map.isStyleLoaded()) return;

		try {
			// Make sure we have a valid data key first
			const dataKey = impactMapState.dataMapKey;
			if (!dataKey || !impactDataMap[dataKey]) {
				console.warn('Cannot update palette - invalid data key');
				return;
			}
			
			// Get the current style stops and palette
			const styleStops = impactDataMap[dataKey].data_info.style_stops;
			
			// Refresh our palette (just to be sure we have the latest)
			currentPalette = getPalette();
			
			console.log('Updating map with palette:', currentPalette);
			console.log('Using style stops:', styleStops);
			
			map.setPaintProperty('raster-layer', 'raster-color', [
				'interpolate',
				['linear'],
				['raster-value'],
				styleStops[0], currentPalette[0],
				styleStops[1], currentPalette[1],
				styleStops[2], currentPalette[2],
				styleStops[3], currentPalette[3],
				styleStops[4], currentPalette[4]
			]);
		} catch (error) {
			console.error('Error updating map palette:', error);
		}
	}

	// Function to update the map source when data name changes
	function updateMapSource() {
		if (!map || !map.isStyleLoaded()) return;

		try {
			// Make sure we have a valid data key first
			const dataKey = impactMapState.dataMapKey;
			if (!dataKey || !impactDataMap[dataKey]) {
				console.warn('Cannot update source - invalid data key');
				return;
			}
			
			// If the source already exists, remove it along with its layers
			if (map.getSource('raster-source')) {
				if (map.getLayer('raster-layer')) {
					map.removeLayer('raster-layer');
				}
				map.removeSource('raster-source');
			}

			// Construct new tile URL based on state
			const baseUrl = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/impact-map-raster-tiles/';
			const tileUrl = impactMapState.dataName
				? `${baseUrl}all_countries_merged_hex8_${impactMapState.dataName}/{z}/{x}/{y}.png`
				: `${baseUrl}all_countries_merged_hex8_rwi/{z}/{x}/{y}.png`;

			console.log('Using tile URL:', tileUrl);

			// Add new source
			map.addSource('raster-source', {
				type: 'raster',
				tiles: [tileUrl],
				tileSize: 256,
				scheme: 'tms',
				minzoom: 0,
				maxzoom: 10
			});

			// Get style stops and refresh palette
			const styleStops = impactDataMap[dataKey].data_info.style_stops;
			currentPalette = getPalette();
			
			console.log('Adding layer with palette:', currentPalette);
			console.log('Using style stops:', styleStops);

			// Add layer with raster-color interpolation
			map.addLayer({
				id: 'raster-layer',
				type: 'raster',
				source: 'raster-source',
				minzoom: 0,
				maxzoom: 22,
				paint: {
					'raster-color': [
						'interpolate',
						['linear'],
						['raster-value'],
						styleStops[0], currentPalette[0],
						styleStops[1], currentPalette[1],
						styleStops[2], currentPalette[2],
						styleStops[3], currentPalette[3],
						styleStops[4], currentPalette[4]
					],
					'raster-color-mix': [255, 255, 255, 255],
					'raster-color-range': [0, 255]
				}
			});
		} catch (error) {
			console.error('Error updating map source:', error);
		}
	}

	// Update currentPalette when dataMapKey changes
	$effect(() => {
		const newKey = impactMapState.dataMapKey;
		// Only update if the key is valid
		if (newKey && impactDataMap[newKey]) {
			// Update our palette
			currentPalette = getPalette();
			console.log('Effect updated palette to:', currentPalette);
			
			// Update the map if it's ready
			if (map && map.isStyleLoaded() && map.getLayer('raster-layer')) {
				updateMapPalette();
			}
		}
	});

	// Update map source when data name changes
	$effect(() => {
		if (map && map.isStyleLoaded() && impactMapState.dataName) {
			updateMapSource();
		}
	});

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

		map.on('load', () => {
			try {
				// Make sure we have a valid data key first
				const dataKey = impactMapState.dataMapKey;
				if (!dataKey || !impactDataMap[dataKey]) {
					console.warn('Cannot initialize map - invalid data key');
					return;
				}
				
				// Initial map setup
				const baseUrl = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/impact-map-raster-tiles/';
				const tileUrl = impactMapState.dataName
					? `${baseUrl}all_countries_merged_hex8_${impactMapState.dataName}/{z}/{x}/{y}.png`
					: `${baseUrl}all_countries_merged_hex8_rwi/{z}/{x}/{y}.png`;

				console.log('Initial setup with URL:', tileUrl);

				// Add source
				map.addSource('raster-source', {
					type: 'raster',
					tiles: [tileUrl],
					tileSize: 256,
					scheme: 'tms',
					minzoom: 0,
					maxzoom: 10
				});

				// Get style stops and fresh palette
				const styleStops = impactDataMap[dataKey].data_info.style_stops;
				currentPalette = getPalette();
				
				console.log('Initial setup with palette:', currentPalette);
				console.log('Initial setup with stops:', styleStops);

				// Add layer with raster-color interpolation
				map.addLayer({
					id: 'raster-layer',
					type: 'raster',
					source: 'raster-source',
					minzoom: 0,
					maxzoom: 22,
					paint: {
						'raster-color': [
							'interpolate',
							['linear'],
							['raster-value'],
							styleStops[0], currentPalette[0],
							styleStops[1], currentPalette[1],
							styleStops[2], currentPalette[2],
							styleStops[3], currentPalette[3],
							styleStops[4], currentPalette[4]
						],
						'raster-color-mix': [255, 0, 0, 0],
						'raster-color-range': [0, 255]
					}
				});
				
				console.log('Initial map setup complete');
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