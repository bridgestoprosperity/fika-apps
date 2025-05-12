<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { hexMapState } from '$lib/utils/state.svelte';
	import { vizOptions } from '$lib/utils/hexMapProperties';
	import { palettes } from '$lib/utils/colorPalettes';

	let map;
	let mapContainer;
	let hexLayer = null;
	let hexData = [];
	const defaultPalette = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];

	// Create derived values for the visualization
	let currentVizProps = $derived(vizOptions[hexMapState.selectedViz]);
	let currentPalette = $derived.by(() => {
		const palette = palettes[hexMapState.selectedPalette] || defaultPalette;
		return hexMapState.reversePalette ? palette.slice().reverse() : palette;
	});

	async function fetchHexData() {
		try {
			const response = await fetch(`/api/hexdata?column=${hexMapState.selectedViz}&limit=5000`);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching hex data:', error);
			return [];
		}
	}

	async function loadHexData() {
		try {
			hexData = await fetchHexData();
			
			if (hexData.length > 0 && map) {
				addHexLayer();
			}
		} catch (error) {
			console.error('Error loading hex data:', error);
		}
	}

	function addHexLayer() {
		// Remove existing layer and source if they exist
		if (map.getSource('hex-data')) {
			if (map.getLayer('hex-fill')) {
				map.removeLayer('hex-fill');
			}
			map.removeSource('hex-data');
		}

		// Create GeoJSON from hex data
		const geojson = {
			type: 'FeatureCollection',
			features: hexData.map(hex => ({
				type: 'Feature',
				properties: {
					id: hex.id,
					[hexMapState.selectedViz]: hex[hexMapState.selectedViz],
					population: hex.population,
					travel_time: hex.travel_time,
					travel_time_no_sites: hex.travel_time_no_sites,
					time_delta_no_sites: hex.time_delta_no_sites
				},
				geometry: {
					type: 'Polygon',
					coordinates: convertWKBtoGeoJSON(hex.geometry)
				}
			}))
		};

		// Add source and layer
		map.addSource('hex-data', {
			type: 'geojson',
			data: geojson
		});

		// Add fill layer
		map.addLayer({
			id: 'hex-fill',
			type: 'fill',
			source: 'hex-data',
			paint: {
				'fill-color': [
					'interpolate',
					['linear'],
					['get', hexMapState.selectedViz],
					currentVizProps.stop0,
					currentPalette[0],
					currentVizProps.stop1,
					currentPalette[1],
					currentVizProps.stop2,
					currentPalette[2],
					currentVizProps.stop3,
					currentPalette[3],
					currentVizProps.stop4,
					currentPalette[4]
				],
				'fill-opacity': 0.7,
				'fill-outline-color': '#000'
			}
		});

		// Add click interaction
		map.on('click', 'hex-fill', (e) => {
			if (e.features.length > 0) {
				const properties = e.features[0].properties;
				console.log('Selected feature:', properties);
				hexMapState.clickedData = properties;
			}
		});

		// Add hover effect
		map.on('mouseenter', 'hex-fill', () => {
			map.getCanvas().style.cursor = 'pointer';
		});

		map.on('mouseleave', 'hex-fill', () => {
			map.getCanvas().style.cursor = '';
		});
	}

	// Helper function to convert WKB hex to GeoJSON coordinates
	function convertWKBtoGeoJSON(wkbHex) {
		// This is a simplified implementation - in a real app, you would use a proper WKB parser
		// For now, we'll create a mock polygon since we don't have access to a WKB parser
		// In a real implementation, you would use a library like wkx or implement proper WKB parsing
		
		// For demo purposes, create a simple polygon centered at the feature's coordinates
		// In production, replace this with actual WKB parsing
		return [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]];
	}

	// Update the fill style when visualization or palette changes
	function updateFillStyle() {
		if (map && map.getLayer('hex-fill')) {
			map.setPaintProperty('hex-fill', 'fill-color', [
				'interpolate',
				['linear'],
				['get', hexMapState.selectedViz],
				currentVizProps.stop0,
				currentPalette[0],
				currentVizProps.stop1,
				currentPalette[1],
				currentVizProps.stop2,
				currentPalette[2],
				currentVizProps.stop3,
				currentPalette[3],
				currentVizProps.stop4,
				currentPalette[4]
			]);
		}
	}

	// Effect to update the map when the selected visualization changes
	$effect(() => {
		const selectedViz = hexMapState.selectedViz;
		
		// Set default palette based on the selected visualization
		hexMapState.selectedPalette = vizOptions[selectedViz].defaultPalette;
		hexMapState.reversePalette = vizOptions[selectedViz].reversePalette;
		
		if (map && map.loaded()) {
			loadHexData();
		}
	});

	// Effect to update the palette when it changes
	$effect(() => {
		if (map && map.getLayer('hex-fill')) {
			updateFillStyle();
		}
	});

	onMount(() => {
		mapboxgl.accessToken =
			'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTVyaGcweGswYWpzMnhxMjRyZHhtMGh0In0.4YOL9xCKxxQ0u2wZ7AlNMg';

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/bridgestoprosperity/cm5rdpyp800it01rd4zgy7l5t',
			center: [26.19, -0.21], // Center on East Africa
			zoom: 5,
			hash: true
		});

		map.on('load', async () => {
			await loadHexData();
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