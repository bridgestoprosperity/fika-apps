import eduIcon from '$lib/images/map-icons/edu-hex.png';

export class EduLayerManager {
	constructor(map) {
		this.map = map;
		this.hoveredEduId = null;
	}

	async initialize() {
		if (!this.map) {
			console.warn('Map not available for initializing education layers');
			return;
		}

		try {

			// Add vector tile source using Mapbox tileset
			this.map.addSource('edu-source', {
				type: 'vector',
				url: 'mapbox://bridgestoprosperity.4gfnl483',
				minzoom: 0,
				maxzoom: 22
			});

			// Load education icon from static folder
			this.map.loadImage(eduIcon, (error, image) => {
				if (error) {
					console.error('Error loading education icon:', error);
					return;
				}

				// Add the image to the map if it doesn't already exist
				if (!this.map.hasImage('edu-hex')) {
					this.map.addImage('edu-hex', image);
				}

				// Add education layer with icon behind waterway layer
				this.map.addLayer({
					id: 'edu-layer',
					type: 'symbol',
					source: 'edu-source',
					'source-layer': 'education_facilities',
					minzoom: 7.8,
					maxzoom: 22,
					layout: {
						'icon-image': 'edu-hex',
						'icon-size': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.04, 14.5, 0.5],
						'icon-allow-overlap': true,
						'icon-ignore-placement': true
					},
					paint: {
						'icon-opacity': ['interpolate', ['linear'], ['zoom'], 7.8, 0, 8, 0.7, 14, 0.8]
					}
				}, 'waterway');

				// Add hover layer - initially hidden, shows only the hovered education facility
				this.map.addLayer({
					id: 'edu-hover-layer',
					type: 'symbol',
					source: 'edu-source',
					'source-layer': 'education_facilities',
					minzoom: 7.8,
					maxzoom: 22,
					layout: {
						'icon-image': 'edu-hex',
						'icon-size': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.04, 14.5, 0.5],
						'icon-allow-overlap': true,
						'icon-ignore-placement': true
					},
					paint: {
						'icon-opacity': 1,
						'icon-translate': [0, -5]
					},
					filter: ['==', 'all_education_facilities_index', ''] // Initially hide all education facilities
				}, 'waterway');
			});
		} catch (error) {
			console.error('Error initializing education layers:', error);
		}
	}

	cleanupExistingLayer() {
		if (this.map.getLayer('edu-hover-layer')) {
			this.map.removeLayer('edu-hover-layer');
		}
		
		if (this.map.getLayer('edu-layer')) {
			this.map.removeLayer('edu-layer');
		}

		if (this.map.getSource('edu-source')) {
			this.map.removeSource('edu-source');
		}
	}

	handleEduHover(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['edu-layer', 'edu-hover-layer']
		});

		if (features.length > 0) {
			// Change cursor to pointer
			this.map.getCanvas().style.cursor = 'pointer';
			
			const eduId = features[0].properties.all_education_facilities_index;
			
			// Hide the hovered education facility from the base layer
			this.map.setFilter('edu-layer', ['!=', 'all_education_facilities_index', eduId]);
			
			// Show only the hovered education facility in the hover layer
			this.map.setFilter('edu-hover-layer', ['==', 'all_education_facilities_index', eduId]);
			
		} else {
			// Reset cursor
			this.map.getCanvas().style.cursor = '';
			
			// Show all education facilities in base layer
			this.map.setFilter('edu-layer', null);
			
			// Hide all education facilities in hover layer
			this.map.setFilter('edu-hover-layer', ['==', 'all_education_facilities_index', '']);
		}
	}

	handleEduClick(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['edu-layer']
		});

		if (features.length) {
			const feature = features[0];
			console.log('Clicked education facility feature:', feature.properties);
		}
	}
}