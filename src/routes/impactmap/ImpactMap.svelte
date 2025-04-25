<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import { impactMapState } from '$lib/utils/state.svelte';
	import { impactDataMap } from '$lib/utils/impactDataMap';
	import { palettes } from '$lib/utils/colorPalettes';
	
	// Debug state changes
	$effect(() => {
		console.log('State tracking - current dataMapKey:', impactMapState.dataMapKey);
	});

	let map;
	let mapContainer;

	// Get the current palette explicitly, NOT using $derived
	function getPalette() {
		const dataKey = impactMapState.dataMapKey;
		if (!dataKey || !impactDataMap[dataKey]) return palettes.viridis;
		
		const colorScale = impactDataMap[dataKey].meta_info.color_scale;
		const reverse = impactDataMap[dataKey].meta_info.reverse_color_scale;
		
		if (reverse) {
			console.log('Reversing color scale:', colorScale, [...palettes[colorScale]].reverse(), palettes[colorScale]);
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

	// Function to update the map source when data key changes
	function updateMapSource() {
		if (!map || !map.isStyleLoaded()) {
			console.warn('Cannot update source - map not ready');
			return;
		}

		try {
			// Make sure we have a valid data key first
			const dataKey = impactMapState.dataMapKey;
			console.log('updateMapSource called with dataKey:', dataKey);
			
			if (!dataKey || !impactDataMap[dataKey]) {
				console.warn('Cannot update source - invalid data key');
				return;
			}
			
			console.log('Updating map source for data key:', dataKey);
			console.log('Data available:', impactDataMap[dataKey]);
			
			// If the source already exists, remove it along with its layers
			if (map.getSource('raster-source')) {
				console.log('Removing existing layer and source');
				if (map.getLayer('raster-layer')) {
					map.removeLayer('raster-layer');
				}
				map.removeSource('raster-source');
			}
			
			// Get the data name from the selected data key's meta info
			const dataName = impactDataMap[dataKey].meta_info.data_name;
			console.log('Using data name from meta_info:', dataName);
			
			// Construct new tile URL based on actual data name from the selected data
			const baseUrl = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/impact-map-raster-tiles/';
			const tileUrl = `${baseUrl}all_countries_merged_hex8_${dataName}/{z}/{x}/{y}.png`;

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
					'raster-color-mix': [255, 0, 0, 0],
					'raster-color-range': [0, 255]
				}
			});
			
			console.log('Map source and layer updated successfully');
		} catch (error) {
			console.error('Error updating map source:', error);
			console.error('Error details:', error.stack || error.message);
		}
	}

	// Update currentPalette when dataMapKey changes
	$effect(() => {
		// Store the key in a variable to ensure reactivity
		const newKey = impactMapState.dataMapKey;
		console.log('Effect tracking dataMapKey:', newKey);
		
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

	// Update map source when dataMapKey changes
	$effect(() => {
		// Explicitly access the dataMapKey to make sure the effect tracks it
		const currentDataKey = impactMapState.dataMapKey;
		console.log('Effect detected dataMapKey change to:', currentDataKey);
		
		if (map && map.isStyleLoaded() && currentDataKey) {
			// Log that we're about to update the source
			console.log('Updating map source due to dataMapKey change');
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
				
				// Get the data name from the selected data key's meta info
				const dataName = impactDataMap[dataKey].meta_info.data_name;
				
				// Initial map setup
				const baseUrl = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/impact-map-raster-tiles/';
				const tileUrl = `${baseUrl}all_countries_merged_hex8_${dataName}/{z}/{x}/{y}.png`;

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