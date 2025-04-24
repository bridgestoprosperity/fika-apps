<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { impactMapDatabaseState } from '$lib/utils/state.svelte';
	import { palettes } from '$lib/utils/colorPalettes';
	import { vizOptions } from '$lib/utils/hexMapProperties';

	let map;
	let mapContainer;
	let postgresData = [];
	let hexData = [];
	let mapLoaded = false;

	// Function to load data from PostgreSQL
	async function loadPostgresData() {
		try {
			impactMapDatabaseState.loadingData = true;
			impactMapDatabaseState.error = null;

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
				impactMapDatabaseState.error = 'No bridges found in the database';
				return;
			}

			// Use the database data
			postgresData = data;
			impactMapDatabaseState.dataCount = data.length;

			// Enable clustering for large datasets
			impactMapDatabaseState.enableClustering = true;

			// If map is loaded, update the data layer
			if (map && mapLoaded) {
				updateMapData();
			}
		} catch (error) {
			impactMapDatabaseState.error = `Error loading data: ${error.message}`;
		} finally {
			impactMapDatabaseState.loadingData = false;
		}
	}

	// Function to load hex data from the database
	async function loadHexData() {
		try {
			// Set loading state
			impactMapDatabaseState.loadingData = true;
			
			console.log("Loading hex data from API...");
			
			// Query the database for hex data
			const response = await fetch(`/api/hexdata?column=${impactMapDatabaseState.hexDataViz}&limit=1000000`);
			
			if (!response.ok) {
				throw new Error(`Failed to fetch hex data: ${response.status} ${response.statusText}`);
			}
			
			const data = await response.json();
			console.log("Received data from API, length:", data.length);
			
			// Check if we received data with geometry
			if (!data || data.length === 0) {
				throw new Error('No hex data returned from API');
			}
			
			// Debug the first item to see what we have
			console.log("Sample hex data item:", data[0]);
			
			// Check for geojson field
			if (!data.some(hex => hex.geojson)) {
				console.warn('Hex data missing GeoJSON geometry, using sample shapes instead');
				
				// Create a modified dataset with generated shapes based on centroids
				hexData = data.map(hex => ({
					...hex,
					// Add generated polygon coordinates based on centroids
					generatedShape: true
				}));
			} else {
				// Use the real data with geometry
				hexData = data;
			}
			console.log(`Processed ${hexData.length} hex items`);
			
			// If map is loaded, update the hex layer
			if (map && mapLoaded) {
				console.log("Updating hex layer...");
				updateHexLayer();
			} else {
				console.log("Map not yet loaded, will update layer later");
			}
		} catch (error) {
			console.error(`Error loading hex data: ${error.message}`);
			impactMapDatabaseState.error = `Error loading hex data: ${error.message}`;
			// Turn off hex layer since we couldn't load data
			impactMapDatabaseState.showHexLayer = false;
		} finally {
			impactMapDatabaseState.loadingData = false;
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
			features: data.map((item) => {
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

	// Function to create GeoJSON for hex data - requires proper geojson data from database
	function hexDataToGeoJSON(data) {
		return {
			type: 'FeatureCollection',
			features: data.map(hex => {
				try {
					// Extract basic properties
					const properties = {
						id: hex.id || `hex-${Math.random().toString(36).substring(2, 10)}`
					};
					
					// Add any other available properties
					if (hex.population !== undefined) {
						properties.population = hex.population;
					}
					
					if (hex.travel_time !== undefined) {
						properties.travel_time = hex.travel_time;
					}
					
					// If we have real GeoJSON from the database
					if (hex.geojson) {
						try {
							// Try to parse the GeoJSON
							const geometry = JSON.parse(hex.geojson);
							
							return {
								type: 'Feature',
								properties: properties,
								geometry: geometry
							};
						} catch (e) {
							console.warn("Failed to parse GeoJSON:", e);
						}
					}
					
					// If we have a generated shape flag or need to fall back
					if (hex.generatedShape || !hex.geojson) {
						if (hex.longitude && hex.latitude) {
							// Create a simple hexagon shape around the center
							const size = 0.015;
							const center = [parseFloat(hex.longitude), parseFloat(hex.latitude)];
							
							// Create a regular hexagon
							const coordinates = [];
							for (let i = 0; i < 6; i++) {
								const angle = (Math.PI / 3) * i;
								// Adjust longitude more to account for the earth's curvature
								const x = center[0] + size * 1.5 * Math.cos(angle);
								const y = center[1] + size * Math.sin(angle);
								coordinates.push([x, y]);
							}
							
							// Close the polygon by repeating the first point
							coordinates.push([...coordinates[0]]);
							
							return {
								type: 'Feature',
								properties: properties,
								geometry: {
									type: 'Polygon',
									coordinates: [coordinates]
								}
							};
						}
					}
					
					// Skip this item if we couldn't create a valid feature
					return null;
				} catch (e) {
					console.error("Error creating GeoJSON for hex:", e);
					return null;
				}
			}).filter(Boolean) // Remove any features that couldn't be created
		};
	}

	// Function to update the hex layer - simplified to focus on just showing outlines
	function updateHexLayer() {
		if (!map || !mapLoaded || hexData.length === 0) return;

		// Create GeoJSON from hex data
		const geojsonData = hexDataToGeoJSON(hexData);
		
		console.log("Hex features count:", geojsonData.features.length);

		// Add or update the hex data source
		if (map.getSource('hex-data')) {
			console.log("Updating existing hex layer source");
			map.getSource('hex-data').setData(geojsonData);
			
			// Set visibility based on showHexLayer
			map.setLayoutProperty(
				'hex-fill',
				'visibility',
				impactMapDatabaseState.showHexLayer ? 'visible' : 'none'
			);
			
			map.setLayoutProperty(
				'hex-outline',
				'visibility',
				impactMapDatabaseState.showHexLayer ? 'visible' : 'none'
			);
		} else {
			// Add source
			console.log("Creating new hex layer source and layers");
			map.addSource('hex-data', {
				type: 'geojson',
				data: geojsonData
			});

			// Add a simple fill layer with minimal styling
			map.addLayer({
				id: 'hex-fill',
				type: 'fill',
				source: 'hex-data',
				layout: {
					visibility: impactMapDatabaseState.showHexLayer ? 'visible' : 'none'
				},
				paint: {
					'fill-color': '#ff3388',  // Changed to more visible magenta
					'fill-opacity': 0.5      // Increased opacity
				}
			});
			
			// Add outline layer to highlight hex boundaries
			map.addLayer({
				id: 'hex-outline',
				type: 'line',
				source: 'hex-data',
				layout: {
					visibility: impactMapDatabaseState.showHexLayer ? 'visible' : 'none'
				},
				paint: {
					'line-color': '#ff3388',  // Changed to more visible magenta
					'line-width': 2,          // Thicker lines
					'line-opacity': 1         // Full opacity
				}
			});
			
			// Add click interaction for debugging
			map.on('click', 'hex-fill', (e) => {
				if (e.features.length > 0) {
					const properties = e.features[0].properties;
					console.log('Selected hex feature:', properties);
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
	}

	// Update map data when data changes or filters are applied
	function updateMapData() {
		if (!map || !mapLoaded || postgresData.length === 0) return;

		// Filter data if year filter is active
		let filteredData = postgresData;
		if (impactMapDatabaseState.filterByYear) {
			filteredData = postgresData.filter(
				(item) =>
					item.year_completed >= impactMapDatabaseState.yearRange[0] &&
					item.year_completed <= impactMapDatabaseState.yearRange[1]
			);
		}

		// Filter by bridge type if not "all bridges"
		if (impactMapDatabaseState.selectedLayer !== 'bridges') {
			filteredData = filteredData.filter((item) =>
				(item.bridge_type || '').toLowerCase().includes(impactMapDatabaseState.selectedLayer.toLowerCase())
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
				cluster: impactMapDatabaseState.enableClustering,
				clusterMaxZoom: 14, // Increase max zoom level for clustering
				clusterRadius: 60, // Larger radius to group more points
				maxzoom: 16, // Maximum zoom level to cache
				buffer: 128, // Larger tile buffer for smoother clustering
				tolerance: 0.5 // Simplify geometries slightly for performance
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
					'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 1, 9, 3],
					// Color ramp for heatmap from B2P colors
					'heatmap-color': [
						'interpolate',
						['linear'],
						['heatmap-density'],
						0,
						'rgba(0, 145, 73, 0)',
						0.2,
						'rgba(0, 145, 73, 0.2)',
						0.4,
						'rgba(0, 145, 73, 0.4)',
						0.6,
						'rgba(0, 145, 73, 0.6)',
						0.8,
						'rgba(0, 145, 73, 0.8)',
						1,
						'rgba(0, 145, 73, 1)'
					],
					// Adjust the heatmap radius by zoom level
					'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 20, 9, 30],
					// Decrease opacity as zoom increases
					'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0.5]
				}
			});

			// If clustering is enabled, add cluster layers
			if (impactMapDatabaseState.enableClustering) {
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
							'#009149', // B2P green for small clusters
							100,
							'#007238', // Darker green for medium clusters
							500,
							'#00572B', // Darker for large clusters
							1000,
							'#004020', // Even darker for very large clusters
							5000,
							'#003018' // Darkest for massive clusters
						],
						'circle-radius': [
							'interpolate',
							['exponential', 0.8],
							['get', 'point_count'],
							20,
							18, // Few points
							100,
							22, // Small cluster
							500,
							28, // Medium cluster
							1000,
							32, // Large cluster
							5000,
							40 // Massive cluster
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
							20,
							12, // Small clusters: smaller text
							100,
							14, // Medium clusters: medium text
							1000,
							16 // Large clusters: larger text
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
				filter: impactMapDatabaseState.enableClustering ? ['!', ['has', 'point_count']] : ['all'],
				minzoom: 5,
				paint: {
					// Fixed circle radius since we don't have people_served
					'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 4, 10, 8],
					'circle-color': '#009149', // B2P primary color
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': 1,
					'circle-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0.7, 10, 0.9]
				}
			});

			// Add click interaction for bridge details
			map.on('click', 'bridges-layer', (e) => {
				if (e.features.length > 0) {
					impactMapDatabaseState.highlightedFeature = e.features[0].properties;
					// console.log map style sheet
					console.log("Map style sheet:", map.getStyle());
				}
			});

			// Add click interaction for clusters
			if (impactMapDatabaseState.enableClustering) {
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
			if (impactMapDatabaseState.enableClustering) {
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
		const _ = [impactMapDatabaseState.filterByYear, impactMapDatabaseState.yearRange, impactMapDatabaseState.selectedLayer];

		if (map && mapLoaded) {
			updateMapData();
		}
	});

	// Effect to toggle hex layer visibility
	$effect(() => {
		console.log("Hex layer visibility changed:", impactMapDatabaseState.showHexLayer);
		if (map && mapLoaded) {
			try {
				if (map.getLayer('hex-fill')) {
					const hexVisibility = impactMapDatabaseState.showHexLayer ? 'visible' : 'none';
					console.log("Setting hex-fill visibility to:", hexVisibility);
					map.setLayoutProperty('hex-fill', 'visibility', hexVisibility);
					
					if (map.getLayer('hex-outline')) {
						map.setLayoutProperty('hex-outline', 'visibility', hexVisibility);
					}
				} else {
					console.log("Hex fill layer doesn't exist yet");
					// If hexData is loaded but layer doesn't exist, try to create it
					if (hexData.length > 0) {
						console.log("Have hex data but no layer - creating layer now");
						updateHexLayer();
					} else if (impactMapDatabaseState.showHexLayer) {
						console.log("No hex data yet - trying to load it now");
						loadHexData();
					}
				}
			} catch (e) {
				console.error("Error toggling hex layer visibility:", e);
			}
		}
	});

	// Effect to reload hex data when visualization changes
	$effect(() => {
		if (impactMapDatabaseState.showHexLayer && impactMapDatabaseState.hexDataViz && map && mapLoaded) {
			loadHexData();
		}
	});

	// Effect to update hex layer style when palette is reversed
	$effect(() => {
		if (map && mapLoaded && map.getLayer('hex-fill') && hexData.length > 0) {
			updateHexLayer();
		}
	});

	// Effect to update satellite layer visibility
	$effect(() => {
		if (map && mapLoaded) {
			const satVisibility = impactMapDatabaseState.satelliteImagery ? 'visible' : 'none';
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
		mapboxgl.accessToken =
			'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTJ1d2Rka3cwNTM5MmxxMWExZmo2OG1tIn0.B6fDwi43tGjtDzyFSrncxQ';

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
			console.log("Map loaded and ready");

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
						impactMapDatabaseState.satelliteImagery ? 'visible' : 'none'
					);
				}
			} catch (error) {
				// Satellite layer not found or not ready
			}

			// Load bridge data from PostgreSQL
			loadPostgresData();
			
			// Load hex data after a short delay to ensure map is fully initialized
			setTimeout(() => {
				console.log("Loading hex data after map initialization");
				loadHexData();
			}, 1000);
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

	{#if impactMapDatabaseState.loadingData}
		<div class="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
			<div class="loading loading-spinner loading-lg text-primary"></div>
		</div>
	{/if}

	{#if impactMapDatabaseState.error}
		<div
			class="absolute bottom-4 right-4 z-50 max-w-md rounded-lg bg-error p-4 text-white shadow-lg">
			<p class="font-semibold">Error loading data</p>
			<p>{impactMapDatabaseState.error}</p>
		</div>
	{/if}

	{#if impactMapDatabaseState.highlightedFeature}
		<div class="absolute bottom-4 right-4 z-40 max-w-md rounded-lg bg-white p-4 shadow-lg">
			<h3 class="mb-2 text-lg font-bold">{impactMapDatabaseState.highlightedFeature.name}</h3>

			{#if impactMapDatabaseState.highlightedFeature.bridge_type}
				<p>
					<span class="font-semibold">Type:</span>
					{impactMapDatabaseState.highlightedFeature.bridge_type}
				</p>
			{/if}

			{#if impactMapDatabaseState.highlightedFeature.year_completed}
				<p>
					<span class="font-semibold">Completed:</span>
					{impactMapDatabaseState.highlightedFeature.year_completed}
				</p>
			{/if}

			{#if impactMapDatabaseState.highlightedFeature.bridge_index}
				<p>
					<span class="font-semibold">Bridge Index:</span>
					{impactMapDatabaseState.highlightedFeature.bridge_index}
				</p>
			{/if}

			{#if impactMapDatabaseState.highlightedFeature.exit_point_index}
				<p>
					<span class="font-semibold">Exit Point Index:</span>
					{impactMapDatabaseState.highlightedFeature.exit_point_index}
				</p>
			{/if}

			{#if impactMapDatabaseState.highlightedFeature.id}
				<p><span class="font-semibold">ID:</span> {impactMapDatabaseState.highlightedFeature.id}</p>
			{/if}

			<button
				class="btn btn-circle btn-sm absolute right-2 top-2"
				on:click={() => (impactMapDatabaseState.highlightedFeature = null)}>
				✕
			</button>
		</div>
	{/if}
</div>