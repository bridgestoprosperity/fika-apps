import { impactDataMap } from '$lib/utils/impactmap/impactDataMap';
import { ColorUtils } from './ColorUtils.svelte.js';

export class HexLayerManager {
	constructor(map) {
		this.map = map;
		this.colorUtils = new ColorUtils();
		this.hoverTimeout = null;
		this.currentHoveredId = null;
	}

	async initialize() {
		if (!this.map) {
			console.warn('Map not available for initializing hex layers');
			return;
		}

		try {
			console.log('Initializing hex layers with Mapbox Vector Tiles');

			const hexColorExpression = this.colorUtils.getHexColorExpression();
			if (!hexColorExpression) {
				console.warn('No valid hex color expression');
				return;
			}

			// Add vector tile source using Mapbox tileset
			this.map.addSource('hex-source', {
				type: 'vector',
				url: 'mapbox://bridgestoprosperity.hex8-demographic',
				minzoom: 0,
				maxzoom: 22
			});

			// Add hex8 fill layer (for zoom 7.5+) behind waterway layer
			this.map.addLayer({
				id: 'hex-layer',
				type: 'fill',
				source: 'hex-source',
				'source-layer': 'hex8-demographic', // Default to demographic source layer
				minzoom: 0,
				maxzoom: 22,
				filter: ['!=', ['get', 'population'], 0], // Default filter, will be updated when layer updates
				paint: {
					'fill-color': hexColorExpression,
					'fill-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 8.2, 0.8]
				}
			}, 'waterway');

			// Add hex hover outline layer - initially hidden
			this.map.addLayer({
				id: 'hex-hover-layer',
				type: 'line',
				source: 'hex-source',
				'source-layer': 'hex8-demographic',
				minzoom: 0,
				maxzoom: 22,
				paint: {
					'line-color': '#249EA0',
					'line-width': 3,
					'line-opacity': 1
				},
				filter: ['==', ['id'], null] // Initially hide all hexes
			}, 'waterway');

		} catch (error) {
			console.error('Error initializing hex layers:', error);
		}
	}

	updateLayer(dataKey) {
		if (!dataKey || !impactDataMap[dataKey]) {
			console.warn('Invalid data key for hex layer:', dataKey);
			return;
		}

		// Define the tilesets and their corresponding data keys with unique source layers
		const tilesets = {
			'mapbox://bridgestoprosperity.demographic_hex_tiles_may2025': {
				sourceLayer: 'hex8-demographic',
				dataKeys: [
					'population',
					'births',
					'pregnancies',
					'rwi',
					'underweight',
					'female_educational_attainment_mean',
					'male_educational_attainment_mean'
				]
			},
			'mapbox://bridgestoprosperity.travel_time_hex_tiles_may2025': {
				sourceLayer: 'hex8-travel-time',
				dataKeys: [
					'travel_time_health_posts',
					'travel_time_major_roads',
					'travel_time_secondary_schools',
					'travel_time_health_centers',
					'travel_time_semi_dense_urban',
					'travel_time_all_health',
					'travel_time_major_hospitals',
					'travel_time_primary_schools',
					'travel_time_all_education'
				]
			},
			'mapbox://bridgestoprosperity.tt_no_bridges_hex_tiles_may2025': {
				sourceLayer: 'hex8-travel-time-no-bridges',
				dataKeys: [
					'travel_time_no_sites_all_health',
					'travel_time_no_sites_secondary_schools',
					'travel_time_no_sites_health_centers',
					'travel_time_no_sites_major_roads',
					'travel_time_no_sites_primary_schools',
					'travel_time_no_sites_semi_dense_urban',
					'travel_time_no_sites_all_education',
					'travel_time_no_sites_major_hospitals',
					'travel_time_no_sites_health_posts'
				]
			},
			'mapbox://bridgestoprosperity.time_delta_hex_tiles_may2025': {
				sourceLayer: 'hex8-time-delta',
				dataKeys: [
					'time_delta_no_sites_all_education',
					'time_delta_no_sites_semi_dense_urban',
					'time_delta_no_sites_secondary_schools',
					'time_delta_no_sites_all_health',
					'time_delta_no_sites_health_centers',
					'time_delta_no_sites_major_roads',
					'time_delta_no_sites_major_hospitals',
					'time_delta_no_sites_health_posts',
					'time_delta_no_sites_primary_schools'
				]
			}
		};

		// Find which tileset contains this dataKey
		let hexSource = null;
		let sourceLayer = null;
		for (const [url, tilesetInfo] of Object.entries(tilesets)) {
			if (tilesetInfo.dataKeys.includes(dataKey)) {
				hexSource = url;
				sourceLayer = tilesetInfo.sourceLayer;
				break;
			}
		}

		if (!hexSource) {
			console.error(`Data key '${dataKey}' not found in any tileset`);
			return;
		}

		const currentSource = this.map.getSource('hex-source');
		const currentSourceUrl = currentSource?.url;

		// Check if we need to update the source
		if (!currentSource || currentSourceUrl !== hexSource) {
			console.log(`Switching from source ${currentSourceUrl} to ${hexSource}`);

			// Remove existing layer and source
			this.cleanupExistingLayer();

			// Add new source
			this.map.addSource('hex-source', {
				type: 'vector',
				url: hexSource,
				minzoom: 0,
				maxzoom: 22
			});

			this.map.addLayer({
				id: 'hex-layer',
				type: 'fill',
				source: 'hex-source',
				'source-layer': sourceLayer,
				minzoom: 0,
				maxzoom: 22,
				// filter for any 0 values
				filter: ['!=', ['get', dataKey], 0],
				paint: {
					'fill-color': this.colorUtils.getHexColorExpression(dataKey),
					'fill-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 8.2, 0.8]
				}
			}, 'waterway');

			// Add hex hover outline layer for new tileset
			this.map.addLayer({
				id: 'hex-hover-layer',
				type: 'line',
				source: 'hex-source',
				'source-layer': sourceLayer,
				minzoom: 0,
				maxzoom: 22,
				paint: {
					'line-color': '#A4EED0',
					'line-width': 3,
					'line-opacity': 1
				},
				filter: ['==', ['id'], null] // Initially hide all hexes
			}, 'waterway');

		} else {
			// Just update the paint property
			this.map.setPaintProperty(
				'hex-layer',
				'fill-color',
				this.colorUtils.getHexColorExpression(dataKey)
			);
		}
	}

	cleanupExistingLayer() {
		if (this.map.getLayer('hex-hover-layer')) {
			this.map.removeLayer('hex-hover-layer');
		}
		
		if (this.map.getLayer('hex-layer')) {
			this.map.removeLayer('hex-layer');
		}

		if (this.map.getSource('hex-source')) {
			this.map.removeSource('hex-source');
		}
	}

	handleHexHover(e) {
		// Clear any existing timeout
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
			this.hoverTimeout = null;
		}

		// Check if there are any bridge features at this location
		const bridgeFeatures = this.map.queryRenderedFeatures(e.point, {
			layers: ['bridge-layer', 'bridge-hover-layer']
		});

		// If bridges are being hovered, don't show hex hover
		if (bridgeFeatures.length > 0) {
			// Clear current hover if bridges take precedence
			this.currentHoveredId = null;
			this.map.setFilter('hex-hover-layer', ['==', ['id'], null]);
			return;
		}

		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['hex-layer', 'hex-hover-layer']
		});

		if (features.length > 0) {
			// Change cursor immediately
			this.map.getCanvas().style.cursor = 'pointer';
			
			const feature = features[0];
			const featureId = feature.id;
			
			// Only update if it's a different hex
			if (featureId !== this.currentHoveredId) {
				// Debounce the hover effect - wait 50ms after mouse stops moving
				this.hoverTimeout = setTimeout(() => {
					this.currentHoveredId = featureId;
					// Show outline for the hovered hex
					this.map.setFilter('hex-hover-layer', ['==', ['id'], featureId]);
				}, 50);
			}
		} else {
			// Reset cursor immediately
			this.map.getCanvas().style.cursor = '';
			
			// Clear current hover immediately when leaving hex area
			this.currentHoveredId = null;
			this.map.setFilter('hex-hover-layer', ['==', ['id'], null]);
		}
	}

	handleHexClick(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['hex-layer']
		});

		if (features.length) {
			const feature = features[0];
			console.log('Clicked hex feature:', feature.properties);
		}

		// Log the paint values
		const paintValues = this.map.getPaintProperty('hex-layer', 'fill-color');
	}
}
