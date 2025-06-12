import bridgeIcon from '$lib/images/map-icons/bridge-hex.png';

export class BridgeLayerManager {
	constructor(map) {
		this.map = map;
		this.hoveredBridgeId = null;
	}

	async initialize() {
		if (!this.map) {
			console.warn('Map not available for initializing bridge layers');
			return;
		}

		try {

			// Add vector tile source using Mapbox tileset
			this.map.addSource('bridge-source', {
				type: 'vector',
				url: 'mapbox://bridgestoprosperity.ac38d6t8',
				minzoom: 0,
				maxzoom: 22
			});

			// Load bridge icon from static folder
			this.map.loadImage(bridgeIcon, (error, image) => {
				if (error) {
					console.error('Error loading bridge icon:', error);
					return;
				}

				// Add the image to the map if it doesn't already exist
				if (!this.map.hasImage('bridge-hex')) {
					this.map.addImage('bridge-hex', image);
				}

				// Add bridge layer with icon behind waterway layer
				this.map.addLayer({
					id: 'bridge-layer',
					type: 'symbol',
					source: 'bridge-source',
					'source-layer': 'all_bridges_tiny',
					minzoom: 7.8,
					maxzoom: 22,
					layout: {
						'icon-image': 'bridge-hex',
						'icon-size': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.02, 14.5, 0.3],
						'icon-allow-overlap': true,
						'icon-ignore-placement': true
					},
					paint: {
						'icon-opacity': ['interpolate', ['linear'], ['zoom'], 7.8, 0, 8, 0.7, 14, 0.8]
					}
				}, 'waterway');

				// Add hover layer - initially hidden, shows only the hovered bridge
				this.map.addLayer({
					id: 'bridge-hover-layer',
					type: 'symbol',
					source: 'bridge-source',
					'source-layer': 'all_bridges_tiny',
					minzoom: 7.8,
					maxzoom: 22,
					layout: {
						'icon-image': 'bridge-hex',
						'icon-size': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.02, 14.5, 0.3],
						'icon-allow-overlap': true,
						'icon-ignore-placement': true
					},
					paint: {
						'icon-opacity': 1,
						'icon-translate': [0, -5]
					},
					filter: ['==', 'bridge_index', ''] // Initially hide all bridges
				}, 'waterway');
			});
		} catch (error) {
			console.error('Error initializing bridge layers:', error);
		}
	}

	cleanupExistingLayer() {
		if (this.map.getLayer('bridge-hover-layer')) {
			this.map.removeLayer('bridge-hover-layer');
		}
		
		if (this.map.getLayer('bridge-layer')) {
			this.map.removeLayer('bridge-layer');
		}

		if (this.map.getSource('bridge-source')) {
			this.map.removeSource('bridge-source');
		}
	}

	handleBridgeHover(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['bridge-layer', 'bridge-hover-layer']
		});

		if (features.length > 0) {
			// Change cursor to pointer
			this.map.getCanvas().style.cursor = 'pointer';
			
			const bridgeIndex = features[0].properties.bridge_index;
			
			// Hide the hovered bridge from the base layer
			this.map.setFilter('bridge-layer', ['!=', 'bridge_index', bridgeIndex]);
			
			// Show only the hovered bridge in the hover layer
			this.map.setFilter('bridge-hover-layer', ['==', 'bridge_index', bridgeIndex]);
			
		} else {
			// Reset cursor
			this.map.getCanvas().style.cursor = '';
			
			// Show all bridges in base layer
			this.map.setFilter('bridge-layer', null);
			
			// Hide all bridges in hover layer
			this.map.setFilter('bridge-hover-layer', ['==', 'bridge_index', '']);
		}
	}

	handleBridgeClick(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['bridge-layer']
		});

		if (features.length) {
			const feature = features[0];
			console.log('Clicked bridge feature:', feature.properties);
		}
	}
}
