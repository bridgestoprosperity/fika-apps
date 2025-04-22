<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { impactMapState } from '$lib/utils/state.svelte';
	import { palettes } from '$lib/utils/colorPalettes';

	let map;
	let mapContainer;
	let postgresData = [];
	let mapLoaded = false;

	// Function to load data from PostgreSQL
	async function loadPostgresData() {
		try {
			impactMapState.loadingData = true;
			impactMapState.error = null;
			
			// Query the database for bridges
			const response = await fetch('/api/bridges?limit=120000');
			
			if (!response.ok) {
				throw new Error('Failed to fetch bridge data');
			}
			
			const data = await response.json();
			
			// Check if we got an error response
			if (data.error) {
				throw new Error(`Database error: ${data.error}`);
			}
			
			if (data.length === 0) {
				impactMapState.error = 'No bridges found in the database';
				return;
			}
			
			// Use the database data
			postgresData = data;
			impactMapState.dataCount = data.length;
			
			// Enable clustering for large datasets
			impactMapState.enableClustering = true;
			
			// If map is loaded, update the data layer
			if (map && mapLoaded) {
				updateMapData();
			}
		} catch (error) {
			impactMapState.error = `Error loading data: ${error.message}`;
		} finally {
			impactMapState.loadingData = false;
		}
	}

	// Helper function to parse PostGIS binary format
	function parsePostGISBinary(hexString, item) {
		// Check if it's a hex string (like from PostGIS)
		if (typeof hexString === 'string' && hexString.startsWith('0101')) {
			// Use the extracted latitude/longitude fields
			if (item.latitude !== undefined && item.longitude !== undefined) {
				const lon = parseFloat(item.longitude);
				const lat = parseFloat(item.latitude);
				return [lon, lat];
			}
			
			// Fallback to Rwanda default if needed
			return [30.0, -2.0]; // Center of Rwanda approximate
		}
		return null;
	}
	
	// Function to convert PostgreSQL data to GeoJSON
	function dataToGeoJSON(data) {
		return {
			type: 'FeatureCollection',
			features: data.map(item => {
				// Check if we have direct geometry data from PostGIS or need to extract coordinates
				let coordinates = [];
				
				if (item.geometry) {
					// Check if geometry is already in GeoJSON format
					if (typeof item.geometry === 'object' && item.geometry.type === 'Point') {
						coordinates = item.geometry.coordinates;
					} 
					// Check if it's a PostGIS binary format
					else if (typeof item.geometry === 'string' && item.geometry.startsWith('0101')) {
						const parsed = parsePostGISBinary(item.geometry, item);
						if (parsed) {
							coordinates = parsed;
						} else if (item.longitude && item.latitude) {
							coordinates = [parseFloat(item.longitude), parseFloat(item.latitude)];
						}
					}
					// Other formats
					else {
						// Try to extract coordinates from various formats
						if (item.longitude && item.latitude) {
							coordinates = [parseFloat(item.longitude), parseFloat(item.latitude)];
						} else {
							// If we can't extract coordinates, use a default
							coordinates = [0, 0];
						}
					}
				} else if (item.longitude && item.latitude) {
					coordinates = [parseFloat(item.longitude), parseFloat(item.latitude)];
				} else {
					// No coordinates found
					coordinates = [0, 0];
				}
				
				return {
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates
					},
					properties: {
						// Core properties we know will exist
						id: item.id || item.ogc_fid,
						name: item.name || `Bridge ${item.bridge_index || item.ogc_fid || item.id}`,
						// Any other properties that might exist
						...item
					}
				};
			})
		};
	}

	// Update map data when data changes or filters are applied
	function updateMapData() {
		if (!map || !mapLoaded || postgresData.length === 0) return;

		// Filter data if year filter is active
		let filteredData = postgresData;
		if (impactMapState.filterByYear) {
			filteredData = postgresData.filter(
				item => 
					item.year_completed >= impactMapState.yearRange[0] && 
					item.year_completed <= impactMapState.yearRange[1]
			);
		}

		// Filter by bridge type if not "all bridges"
		if (impactMapState.selectedLayer !== 'bridges') {
			filteredData = filteredData.filter(
				item => (item.bridge_type || '').toLowerCase().includes(impactMapState.selectedLayer.toLowerCase())
			);
		}

		// Convert to GeoJSON
		const geojsonData = dataToGeoJSON(filteredData);

		// Update or add the source
		if (map.getSource('bridges')) {
			map.getSource('bridges').setData(geojsonData);
		} else {
			map.addSource('bridges', {
				type: 'geojson',
				data: geojsonData,
				cluster: impactMapState.enableClustering,
				clusterMaxZoom: 14,     // Increase max zoom level for clustering
				clusterRadius: 60,      // Larger radius to group more points
				maxzoom: 16,            // Maximum zoom level to cache
				buffer: 128,            // Larger tile buffer for smoother clustering
				tolerance: 0.5          // Simplify geometries slightly for performance
			});

			// Add heatmap layer (shows density of bridges)
			map.addLayer({
				id: 'bridges-heat',
				type: 'heatmap',
				source: 'bridges',
				maxzoom: 9,
				paint: {
					// Increase the heatmap weight based on people served
					'heatmap-weight': 0.8, // Fixed weight since we don't have people_served
					// Increase the heatmap color weight by zoom level
					'heatmap-intensity': [
						'interpolate',
						['linear'],
						['zoom'],
						5, 1,
						9, 3
					],
					// Color ramp for heatmap from B2P colors
					'heatmap-color': [
						'interpolate',
						['linear'],
						['heatmap-density'],
						0, 'rgba(0, 145, 73, 0)',
						0.2, 'rgba(0, 145, 73, 0.2)',
						0.4, 'rgba(0, 145, 73, 0.4)',
						0.6, 'rgba(0, 145, 73, 0.6)',
						0.8, 'rgba(0, 145, 73, 0.8)',
						1, 'rgba(0, 145, 73, 1)'
					],
					// Adjust the heatmap radius by zoom level
					'heatmap-radius': [
						'interpolate',
						['linear'],
						['zoom'],
						4, 20,
						9, 30
					],
					// Decrease opacity as zoom increases
					'heatmap-opacity': [
						'interpolate',
						['linear'],
						['zoom'],
						7, 1,
						9, 0.5
					]
				}
			});
			
			// If clustering is enabled, add cluster layers
			if (impactMapState.enableClustering) {
				// Add cluster circles
				map.addLayer({
					id: 'clusters',
					type: 'circle',
					source: 'bridges',
					filter: ['has', 'point_count'],
					paint: {
						'circle-color': [
							'step',
							['get', 'point_count'],
							'#009149',  // B2P green for small clusters
							100, '#007238',  // Darker green for medium clusters
							500, '#00572B',  // Darker for large clusters
							1000, '#004020', // Even darker for very large clusters
							5000, '#003018'  // Darkest for massive clusters
						],
						'circle-radius': [
							'interpolate',
							['exponential', 0.8],
							['get', 'point_count'],
							20, 18,     // Few points
							100, 22,    // Small cluster
							500, 28,    // Medium cluster
							1000, 32,   // Large cluster
							5000, 40    // Massive cluster
						],
						'circle-stroke-width': 1,
						'circle-stroke-color': '#fff'
					}
				});
				
				// Add cluster count labels
				map.addLayer({
					id: 'cluster-count',
					type: 'symbol',
					source: 'bridges',
					filter: ['has', 'point_count'],
					layout: {
						'text-field': '{point_count_abbreviated}',
						'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
						'text-size': [
							'interpolate',
							['linear'],
							['get', 'point_count'],
							20, 12,    // Small clusters: smaller text
							100, 14,   // Medium clusters: medium text
							1000, 16   // Large clusters: larger text
						],
						'text-allow-overlap': false,
						'text-ignore-placement': false
					},
					paint: {
						'text-color': '#ffffff',
						'text-halo-color': 'rgba(0, 0, 0, 0.2)',
						'text-halo-width': 1.5
					}
				});
			}
			
			// Add circle layer (individual bridges)
			map.addLayer({
				id: 'bridges-layer',
				type: 'circle',
				source: 'bridges',
				filter: impactMapState.enableClustering ? ['!', ['has', 'point_count']] : ['all'],
				minzoom: 5,
				paint: {
					// Fixed circle radius since we don't have people_served
					'circle-radius': [
						'interpolate',
						['linear'],
						['zoom'],
						5, 4,
						10, 8
					],
					'circle-color': '#009149', // B2P primary color
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': 1,
					'circle-opacity': [
						'interpolate',
						['linear'],
						['zoom'],
						5, 0.7,
						10, 0.9
					]
				}
			});

			// Add click interaction for bridge details
			map.on('click', 'bridges-layer', (e) => {
				if (e.features.length > 0) {
					impactMapState.highlightedFeature = e.features[0].properties;
				}
			});
			
			// Add click interaction for clusters
			if (impactMapState.enableClustering) {
				map.on('click', 'clusters', (e) => {
					const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
					const clusterId = features[0].properties.cluster_id;
					
					map.getSource('bridges').getClusterExpansionZoom(clusterId, (err, zoom) => {
						if (err) return;
						
						map.easeTo({
							center: features[0].geometry.coordinates,
							zoom: zoom
						});
					});
				});
			}

			// Add hover effects
			map.on('mouseenter', 'bridges-layer', () => {
				map.getCanvas().style.cursor = 'pointer';
			});
			
			map.on('mouseleave', 'bridges-layer', () => {
				map.getCanvas().style.cursor = '';
			});
			
			// Add hover effect for clusters
			if (impactMapState.enableClustering) {
				map.on('mouseenter', 'clusters', () => {
					map.getCanvas().style.cursor = 'pointer';
				});
				
				map.on('mouseleave', 'clusters', () => {
					map.getCanvas().style.cursor = '';
				});
			}
		}
	}

	// Effect to update data when filter changes
	$effect(() => {
		const _ = [
			impactMapState.filterByYear,
			impactMapState.yearRange,
			impactMapState.selectedLayer
		];
		
		if (map && mapLoaded) {
			updateMapData();
		}
	});

	// Effect to update satellite layer visibility
	$effect(() => {
		if (map && mapLoaded) {
			const satVisibility = impactMapState.satelliteImagery ? 'visible' : 'none';
			try {
				// Only change visibility if the layer exists
				if (map.getLayer('satellite')) {
					map.setLayoutProperty('satellite', 'visibility', satVisibility);
				}
			} catch (error) {
				// Satellite layer not available
			}
		}
	});

	onMount(() => {
		// Initialize Mapbox
		mapboxgl.accessToken = 'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTJ1d2Rka3cwNTM5MmxxMWExZmo2OG1tIn0.B6fDwi43tGjtDzyFSrncxQ';
		
		// Create map without hash to avoid conflict with SvelteKit router
		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/bridgestoprosperity/cm4kippxv01k101slb7hs8mvr',
			center: [26.19, -0.21], // Central Africa as default
			zoom: 4,
			hash: false // Disable hash to avoid conflict with SvelteKit
		});

		map.on('load', () => {
			// Set mapLoaded flag
			mapLoaded = true;
			
			// Add navigation controls
			map.addControl(new mapboxgl.NavigationControl(), 'top-right');
			
			// Add fullscreen control
			map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
			
			// Initialize satellite layer visibility if it exists
			try {
				if (map.getLayer('satellite')) {
					map.setLayoutProperty(
						'satellite', 
						'visibility', 
						impactMapState.satelliteImagery ? 'visible' : 'none'
					);
				}
			} catch (error) {
				// Satellite layer not found or not ready
			}

			// Load data from PostgreSQL
			loadPostgresData();
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
	
	{#if impactMapState.loadingData}
		<div class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
			<div class="loading loading-spinner loading-lg text-primary"></div>
		</div>
	{/if}

	{#if impactMapState.error}
		<div class="absolute bottom-4 right-4 z-50 max-w-md rounded-lg bg-error p-4 text-white shadow-lg">
			<p class="font-semibold">Error loading data</p>
			<p>{impactMapState.error}</p>
		</div>
	{/if}
	
	{#if impactMapState.highlightedFeature}
		<div class="absolute bottom-4 right-4 z-40 max-w-md rounded-lg bg-white p-4 shadow-lg">
			<h3 class="mb-2 text-lg font-bold">{impactMapState.highlightedFeature.name}</h3>
			
			{#if impactMapState.highlightedFeature.bridge_type}
				<p><span class="font-semibold">Type:</span> {impactMapState.highlightedFeature.bridge_type}</p>
			{/if}
			
			{#if impactMapState.highlightedFeature.year_completed}
				<p><span class="font-semibold">Completed:</span> {impactMapState.highlightedFeature.year_completed}</p>
			{/if}
			
			{#if impactMapState.highlightedFeature.bridge_index}
				<p><span class="font-semibold">Bridge Index:</span> {impactMapState.highlightedFeature.bridge_index}</p>
			{/if}
			
			{#if impactMapState.highlightedFeature.exit_point_index}
				<p><span class="font-semibold">Exit Point Index:</span> {impactMapState.highlightedFeature.exit_point_index}</p>
			{/if}
			
			{#if impactMapState.highlightedFeature.id}
				<p><span class="font-semibold">ID:</span> {impactMapState.highlightedFeature.id}</p>
			{/if}
			
			<button 
				class="btn btn-sm btn-circle absolute right-2 top-2" 
				on:click={() => impactMapState.highlightedFeature = null}
			>
				✕
			</button>
		</div>
	{/if}
</div>