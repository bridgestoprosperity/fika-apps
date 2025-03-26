<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { impactMapState } from '$lib/utils/state.svelte';
	import { palettes } from '$lib/utils/colorPalettes';

	let map;
	let mapContainer;
	let postgresData = [];
	let mapLoaded = false;

	// Function to load data from PostgreSQL or fall back to mock data
	async function loadPostgresData() {
		try {
			impactMapState.loadingData = true;
			impactMapState.error = null;

			// Try to load mock data first to ensure we have something to display
			try {
				const mockResponse = await fetch('/api/bridges/mock.json');
				const mockData = await mockResponse.json();
				console.log('Loaded mock data as fallback:', mockData.length, 'bridges');
				
				// Save the mock data for fallback
				const fallbackData = mockData.map(item => ({
					id: item.id,
					name: item.name || `Bridge ${item.id}`,
					bridge_type: item.bridge_type || 'Suspended',
					year_completed: item.year_completed || 2020,
					latitude: parseFloat(item.latitude) || 0,
					longitude: parseFloat(item.longitude) || 0,
					span_length: item.span_length,
					communities_served: item.communities_served,
					people_served: item.people_served,
					country: item.country || 'Rwanda',
					region: item.region || 'Central',
					district: item.district || 'Unknown'
				}));
				
				// Use mock data right away to avoid blank map
				postgresData = fallbackData;
				impactMapState.dataCount = fallbackData.length;
				console.log(`Using ${impactMapState.dataCount} bridges from mock data`);
				
				// If map is loaded, add the data layer
				if (map && mapLoaded) {
					updateMapData();
				}
			} catch (mockError) {
				console.warn('Failed to load mock data:', mockError);
			}

			// Test database connection 
			try {
				const testResponse = await fetch('/api/bridges/test-connection');
				const testResult = await testResponse.json();
				console.log('Database connection test:', testResult);
				
				// If connection test is successful but we don't have data, try force setup
				if (testResult.success) {
					try {
						const setupResponse = await fetch('/api/bridges/force-setup');
						const setupResult = await setupResponse.json();
						console.log('Database setup result:', setupResult);
					} catch (setupError) {
						console.warn('Database setup failed:', setupError);
					}
				} else {
					// Connection failed, but we're already using mock data
					console.log('Using mock data since database connection failed');
					return;
				}
			} catch (testError) {
				console.warn('Database connection test failed:', testError);
				// Continue with mock data, no need to show error
				return;
			}
			
			// Try to query the database directly
			try {
				const response = await fetch('/api/bridges?limit=1000');
				
				if (!response.ok) {
					throw new Error('Failed to fetch bridge data from database');
				}
				
				// For real database data, the response is the data array directly
				const data = await response.json();
				
				// Check if we got an error response instead
				if (data.error) {
					throw new Error(`Database error: ${data.error}`);
				}
				
				console.log(`Loaded ${data.length} bridges from database`);
				
				if (data.length === 0) {
					console.warn('No data returned from simple API, keeping mock data');
				} else {
					// Use the data from simple API
					postgresData = data;
					impactMapState.dataCount = data.length;
					
					// Enable clustering based on data size
					impactMapState.enableClustering = data.length > 50;
					
					// If map is loaded, update the data layer
					if (map && mapLoaded) {
						updateMapData();
					}
				}
				
				// Skip other queries since we have data now
				return;
			} catch (error) {
				console.error('Error loading data from simple API:', error);
				// Continue trying other methods
			}
		} catch (error) {
			console.error('Error in data loading process:', error);
			// Only show error if we don't have any data
			if (postgresData.length === 0) {
				impactMapState.error = 'Failed to load any data: ' + error.message;
				postgresData = [];
				impactMapState.dataCount = 0;
			}
		} finally {
			impactMapState.loadingData = false;
		}
	}

	// Helper function to parse PostGIS binary format
	function parsePostGISBinary(hexString, item) {
		// Log the attempts to parse geometry
		console.log('Trying to parse geometry:', {
			hexString: typeof hexString === 'string' ? hexString.substring(0, 30) + '...' : hexString,
			hasLongitude: !!item.longitude,
			hasLatitude: !!item.latitude,
			rawLon: item.longitude,
			rawLat: item.latitude
		});
		
		// Check if it's a hex string (like from PostGIS)
		if (typeof hexString === 'string' && hexString.startsWith('0101')) {
			console.log(`PostGIS binary detected: ${hexString.substring(0, 30)}...`);
			
			// For now, since we can't properly parse the binary completely, use the latitude/longitude fields
			if (item.latitude !== undefined && item.longitude !== undefined) {
				const lon = parseFloat(item.longitude);
				const lat = parseFloat(item.latitude);
				console.log(`Using raw coordinates: [${lon}, ${lat}]`);
				return [lon, lat];
			}
			
			// If we don't have lat/lon fields, in a production app we would parse the binary,
			// but for now we'll return a default Rwanda location
			console.log('No lat/long fields found, using Rwanda default');
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
						// For debugging - log a few items to see the format
						if (!window.loggedGeometryFormat) {
							console.log('Geometry format example:', item.geometry);
							window.loggedGeometryFormat = true;
						}
						
						// Try to extract coordinates from various formats
						if (item.longitude && item.latitude) {
							coordinates = [parseFloat(item.longitude), parseFloat(item.latitude)];
						} else {
							// If we can't extract coordinates, use a default (this will need to be fixed)
							coordinates = [0, 0];
							console.warn('Failed to extract coordinates for bridge:', item.id);
						}
					}
				} else if (item.longitude && item.latitude) {
					coordinates = [parseFloat(item.longitude), parseFloat(item.latitude)];
				} else {
					// No coordinates found
					coordinates = [0, 0];
					console.warn('No coordinates found for bridge:', item.id);
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
						name: item.name || `Bridge ${item.bridge_index || item.ogc_fid}`,
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
				clusterMaxZoom: 12,
				clusterRadius: 50
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
							500, '#00572B'   // Even darker for large clusters
						],
						'circle-radius': [
							'step',
							['get', 'point_count'],
							20,   // Size for small clusters
							100, 25,  // Size for medium clusters
							500, 30   // Size for large clusters
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
						'text-size': 12
					},
					paint: {
						'text-color': '#ffffff'
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
				console.error('Error setting satellite visibility:', error);
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
				console.warn('Satellite layer not found or not ready');
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
			
			{#if impactMapState.highlightedFeature.ogc_fid}
				<p><span class="font-semibold">ID:</span> {impactMapState.highlightedFeature.ogc_fid}</p>
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