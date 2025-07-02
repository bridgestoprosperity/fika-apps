import healthIcon from '$lib/images/map-icons/health-hex.png';

export class HealthLayerManager {
	constructor(map) {
		this.map = map;
		this.hoveredHealthId = null;
	}

	async initialize() {
		if (!this.map) {
			console.warn('Map not available for initializing health layers');
			return;
		}

		try {

			// Add vector tile source using Mapbox tileset
			console.log('Adding health vector tile source');
			this.map.addSource('health-source', {
				type: 'vector',
				url: 'mapbox://bridgestoprosperity.4gfnl483',
				minzoom: 0,
				maxzoom: 22
			});

			// Load health icon from static folder
			this.map.loadImage(healthIcon, (error, image) => {
				if (error) {
					console.error('Error loading health icon:', error);
					return;
				}

				// Add the image to the map if it doesn't already exist
				if (!this.map.hasImage('health-hex')) {
					this.map.addImage('health-hex', image);
				}

				// Add health layer with icon behind waterway layer
				// TODO: add variables for layout and paint for health layer and the other map layers
				this.map.addLayer({
					id: 'health-layer',
					type: 'symbol',
					source: 'health-source',
					'source-layer': 'health_facilities',
					minzoom: 7.8,
					maxzoom: 22,
					layout: {
						'icon-image': 'health-hex',
						'icon-size': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.01, 14.5, 0.2],
						'icon-allow-overlap': true,
						'icon-ignore-placement': true
					},
					paint: {
						'icon-opacity': ['interpolate', ['linear'], ['zoom'], 7.8, 0, 8, 0.7, 14, 0.8]
					}
				}, 'waterway');

				// Add hover layer - initially hidden, shows only the hovered health facility
				this.map.addLayer({
					id: 'health-hover-layer',
					type: 'symbol',
					source: 'health-source',
					'source-layer': 'health_facilities',
					minzoom: 7.8,
					maxzoom: 22,
					layout: {
						'icon-image': 'health-hex',
						'icon-size': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.04, 14.5, 0.5],
						'icon-allow-overlap': true,
						'icon-ignore-placement': true
					},
					paint: {
						'icon-opacity': 1,
						'icon-translate': [0, -5]
					},
					filter: ['==', 'all_health_facilities_index', ''] // Initially hide all health facilities
				}, 'waterway');
			});
		} catch (error) {
			console.error('Error initializing health layers:', error);
		}
	}

	cleanupExistingLayer() {
		if (this.map.getLayer('health-hover-layer')) {
			this.map.removeLayer('health-hover-layer');
		}
		
		if (this.map.getLayer('health-layer')) {
			this.map.removeLayer('health-layer');
		}

		if (this.map.getSource('health-source')) {
			this.map.removeSource('health-source');
		}
	}

	handleHealthHover(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['health-layer', 'health-hover-layer']
		});

		if (features.length > 0) {
			// Change cursor to pointer
			this.map.getCanvas().style.cursor = 'pointer';
			
			const healthId = features[0].properties.all_health_facilities_index;
			
			// Hide the hovered health facility from the base layer
			this.map.setFilter('health-layer', ['!=', 'all_health_facilities_index', healthId]);
			
			// Show only the hovered health facility in the hover layer
			this.map.setFilter('health-hover-layer', ['==', 'all_health_facilities_index', healthId]);
			
		} else {
			// Reset cursor
			this.map.getCanvas().style.cursor = '';
			
			// Show all health facilities in base layer
			this.map.setFilter('health-layer', null);
			
			// Hide all health facilities in hover layer
			this.map.setFilter('health-hover-layer', ['==', 'all_health_facilities_index', '']);
		}
	}

	handleHealthClick(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['health-layer']
		});

		if (features.length) {
			const feature = features[0];
			console.log('Clicked health facility feature:', feature.properties);
		}
	}

	highlightHealthFacilities(facilityIds) {
		if (!this.map.getLayer('health-layer')) return;

		if (facilityIds && facilityIds.length > 0) {
			// Create filter expression for highlighted health facilities using individual equality checks
			// This avoids the argument limit issue with the 'in' operator
			let highlightFilter;
			if (facilityIds.length === 1) {
				highlightFilter = ['==', ['get', 'all_health_facilities_index'], facilityIds[0]];
			} else {
				// Use 'any' with multiple equality checks for multiple facility IDs
				const equalityChecks = facilityIds.map(id => ['==', ['get', 'all_health_facilities_index'], id]);
				highlightFilter = ['any', ...equalityChecks];
			}

			// Fade out non-highlighted health facilities
			this.map.setPaintProperty('health-layer', 'icon-opacity', [
				'case',
				highlightFilter,
				0.8, // Full opacity for highlighted
				0.2  // Low opacity for others
			]);
		}
	}

	resetFilter() {
		if (!this.map.getLayer('health-layer')) return;

		// Reset to original opacity
		this.map.setPaintProperty('health-layer', 'icon-opacity', [
			'interpolate',
			['linear'],
			['zoom'],
			7.8,
			0,
			8,
			0.7,
			14,
			0.8
		]);
	}
}