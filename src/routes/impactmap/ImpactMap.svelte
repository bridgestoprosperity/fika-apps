<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import { impactMapState } from '$lib/utils/state.svelte';
	import { impactDataMap } from '$lib/utils/impactmap/impactDataMap';
	import { palettes } from '$lib/utils/colorPalettes';

	let map;
	let mapContainer;
	let mapLoaded = $state(false);
	let styleLoaded = $state(false);
	let currentDataKey = $state('');

	// Log state changes so we can debug
	$effect(() => {
		console.log(
			'Map tracking state change:',
			impactMapState.dataMapKey,
			'(current:',
			currentDataKey,
			')'
		);
	});

	// Track when both map and style are loaded
	let mapReady = $derived(mapLoaded && styleLoaded);

	// Helper function to get the tile URL
	function getTileUrl() {
		const dataKey = impactMapState.dataMapKey;
		if (!dataKey || !impactDataMap[dataKey]) {
			console.warn('No valid data key:', dataKey);
			return null;
		}

		const dataName = impactDataMap[dataKey].meta_info.data_name;
		const baseUrl =
			'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/impact-map-raster-tiles/';
		const url = `${baseUrl}all_countries_merged_hex8_${dataName}/{z}/{x}/{y}.png`;

		console.log('Tile URL:', url);
		return url;
	}

	// Helper function to get the raster color expression
	function float32To8Bit(float32Array, min, max) {
		const uint8Array = new Uint8Array(float32Array.length);
		const scale = 255 / (max - min);

		for (let i = 0; i < float32Array.length; i++) {
			const transformed = (float32Array[i] - min) * scale;
			uint8Array[i] = Math.round(Math.max(0, Math.min(255, transformed)));
		}

		return uint8Array;
	}

	function getRasterColorExpression() {
		const dataKey = impactMapState.dataMapKey;
		if (!dataKey || !impactDataMap[dataKey]) {
			console.warn('No valid data key for color expression:', dataKey);
			return null;
		}

		const data = impactDataMap[dataKey];
		
		const styleStops = float32To8Bit(data.data_info.style_stops, data.data_info.min, data.data_info.max);

		// Get appropriate palette
		const colorScale = data.meta_info.color_scale;
		const reverse = data.meta_info.reverse_color_scale;
		const palette = reverse ? [...palettes[colorScale]].reverse() : palettes[colorScale];

		console.log('Color expression using palette:', colorScale, 'reverse:', reverse);

		const colorExpression = [
			'interpolate',
			['linear'],
			['raster-value'],
			styleStops[0],
			palette[0],
			styleStops[1],
			palette[1],
			styleStops[2],
			palette[2],
			styleStops[3],
			palette[3],
			styleStops[4],
			palette[4]
		];
		console.log('Raster color expression:', colorExpression);

		return colorExpression;
	}
	function getHexColorExpression() {
		const dataKey = impactMapState.dataMapKey;
		if (!dataKey || !impactDataMap[dataKey]) {
			console.warn('No valid data key for color expression:', dataKey);
			return null;
		}

		const data = impactDataMap[dataKey];
		const styleStops = data.data_info.style_stops;
		const dataName = data.meta_info.data_name; // Get the data_name

		// Get appropriate palette
		const colorScale = data.meta_info.color_scale;
		const reverse = data.meta_info.reverse_color_scale;
		const palette = reverse ? [...palettes[colorScale]].reverse() : palettes[colorScale];

		const colorExpression = [
			'interpolate',
			['linear'],
			['coalesce', ['to-number', ['get', dataName]], 0], // Use dataName here
			styleStops[0],
			palette[0],
			styleStops[1],
			palette[1],
			styleStops[2],
			palette[2],
			styleStops[3],
			palette[3],
			styleStops[4],
			palette[4]
		];

		console.log('Hex color expression:', colorExpression);
		console.log('Using data field:', dataName); // Log the field name
		console.log('Color expression using palette:', colorScale, 'reverse:', reverse);

		return colorExpression;
	}

	// Function to initialize hex layers with PMTiles
	async function initializeHexLayer() {
		if (!map) {
			console.warn('Map not available for initializing hex layers');
			return;
		}

		try {
			console.log('Initializing hex layers with PMTiles');

			// Add hex8 source for zoom levels 7-22
			// const hex8Url = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/general-pmtiles/all_countries_merged_hex8.pmtiles';
			const hex8Url =
				'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/general-pmtiles/all_countries_merged_hex8.pmtiles';

			const hex8Header = await PmTilesSource.getHeader(hex8Url);
			const hex8Bounds = [
				hex8Header.minLon,
				hex8Header.minLat,
				hex8Header.maxLon,
				hex8Header.maxLat
			];

			const hexColorExpression = getHexColorExpression();
			if (!hexColorExpression) {
				console.warn('No valid hex color expression');
				return;
			}

			map.addSource('hex-source', {
				type: PmTilesSource.SOURCE_TYPE,
				url: hex8Url,
				minzoom: 0,
				maxzoom: hex8Header.maxZoom,
				bounds: hex8Bounds
			});

			// Add hex8 fill layer (for zoom 7.5+)
			map.addLayer({
				id: 'hex-layer',
				type: 'fill',
				source: 'hex-source',
				'source-layer': 'hex8-impact-data',
				minzoom: 8,
				maxzoom: 22,
				paint: {
					'fill-color': hexColorExpression,
					'fill-opacity': 0.75
				}
			});

			console.log('Hex layers initialized successfully');
		} catch (error) {
			console.error('Error initializing hex layers:', error);
		}
	}

	function getHexData(e) {
		// write a function that console logs the data from the map layer hex-layer where it was clicked
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['hex-layer']
		});
		if (features.length) {
			const feature = features[0];
			console.log('Clicked hex feature:', feature.properties);
		}
		// console.log the paint values
		const paintValues = map.getPaintProperty('hex-layer', 'fill-color');
		console.log('Hex layer paint values:', paintValues);
	}

	// Function to update the map visualization
	function updateMapVisualization() {
		if (!map || !mapReady) {
			console.log('Map not ready yet, skipping update');
			return;
		}

		try {
			console.log('Updating map visualization for dataKey:', impactMapState.dataMapKey);

			// Check if data key is valid
			if (!impactMapState.dataMapKey || !impactDataMap[impactMapState.dataMapKey]) {
				console.warn('Invalid data key:', impactMapState.dataMapKey);
				return;
			}

			// Skip update if the data key hasn't changed
			if (currentDataKey === impactMapState.dataMapKey) {
				console.log('Data key unchanged, skipping update');
				return;
			}

			// update hex layer color
			const hexColorExpression = getHexColorExpression();
			if (hexColorExpression) {
				map.setPaintProperty('hex-layer', 'fill-color', hexColorExpression);
			} else {
				console.warn('No valid hex color expression for hex layer');
			}

			// Remove existing layer and source if they exist
			if (map.getLayer('raster-layer')) {
				console.log('Removing existing raster layer');
				map.removeLayer('raster-layer');
			}

			if (map.getSource('raster-source')) {
				console.log('Removing existing raster source');
				map.removeSource('raster-source');
			}

			// Get tile URL
			const tileUrl = getTileUrl();
			if (!tileUrl) {
				console.warn('No valid tile URL');
				return;
			}

			// Add new source
			console.log('Adding source with URL:', tileUrl);
			map.addSource('raster-source', {
				type: 'raster',
				tiles: [tileUrl],
				tileSize: 256,
				scheme: 'tms',
				minzoom: 0,
				maxzoom: 10
			});

			// Get raster color expression
			const rasterColorExpression = getRasterColorExpression();
			if (!rasterColorExpression) {
				console.warn('No valid raster color expression');
				return;
			}

			// Add new layer
			console.log('Adding raster layer');
			map.addLayer({
				id: 'raster-layer',
				type: 'raster',
				source: 'raster-source',
				minzoom: 0,
				maxzoom: 8,
				paint: {
					'raster-color': rasterColorExpression,
					'raster-color-mix': [255, 0, 0, 0],
					'raster-color-range': [0, 255]
				}
			});

			// Update current data key to track changes
			currentDataKey = impactMapState.dataMapKey;
			console.log('Update complete, currentDataKey is now:', currentDataKey);
		} catch (error) {
			console.error('Error updating map visualization:', error);
		}
	}

	// Watch for changes to impactMapState.dataMapKey
	$effect(() => {
		const dataKey = impactMapState.dataMapKey;

		// Only proceed if data key is valid and different from current
		if (dataKey && dataKey !== currentDataKey && impactDataMap[dataKey]) {
			console.log('Data key changed to:', dataKey);

			// Update map if it's ready
			if (mapReady) {
				console.log('Map ready, updating visualization');
				// Use setTimeout to ensure this runs after current execution
				setTimeout(updateMapVisualization, 0);
			} else {
				console.log('Map not ready yet, update will happen when map loads');
			}
		}
	});

	// Initialize map on mount
	onMount(() => {
		console.log('Mounting map component');
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

		// Track when map loads
		map.on('load', () => {
			console.log('Map loaded');
			mapLoaded = true;
		});

		// Track when style loads
		map.on('style.load', async () => {
			console.log('Style loaded');
			styleLoaded = true;

			// Initialize hex layers first

			await initializeHexLayer();
			// Initial setup once style is loaded
			if (impactMapState.dataMapKey) {
				console.log('Setting up initial visualization with dataKey:', impactMapState.dataMapKey);
				setTimeout(updateMapVisualization, 100);
			}
			map.on('click', 'hex-layer', (e) => {
				getHexData(e);
			});
		});
	});

	// Clean up on destroy
	onDestroy(() => {
		if (map) {
			console.log('Cleaning up map');
			map.remove();
		}
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={mapContainer} class="absolute inset-0 h-full w-full"></div>
</div>
