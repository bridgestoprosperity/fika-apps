import { zambiaMapState } from '$lib/utils/state.svelte';

const S3_BASE = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/zambia-analysis-demo';

/**
 * Parse PostgreSQL array format "{val1,val2}" into a JS array of strings.
 */
function parsePgArray(str) {
	if (!str || typeof str !== 'string') return [];
	const cleaned = str.replace(/[{}]/g, '').trim();
	if (!cleaned) return [];
	return cleaned.split(',').map((s) => s.trim());
}

/**
 * Parse PostgreSQL array format into a JS array of numbers.
 */
function parsePgArrayNum(str) {
	if (!str || typeof str !== 'string') return [];
	const cleaned = str.replace(/[{}]/g, '').trim();
	if (!cleaned) return [];
	return cleaned
		.split(',')
		.map((s) => parseInt(s.trim(), 10))
		.filter((n) => !isNaN(n));
}

export class DestinationLayerManager {
	constructor(map, hexLayerManager = null) {
		this.map = map;
		this.hexLayerManager = hexLayerManager;
		this.pathLayerManager = null;
		this.destinationData = null;
	}

	async initialize() {
		if (!this.map) {
			console.warn('Map not available for initializing destination layers');
			return;
		}

		try {
			const response = await fetch(`${S3_BASE}/destinations_itezhitezhi.geojson`);
			const geojson = await response.json();
			this.destinationData = geojson;

			this.map.addSource('destination-source', {
				type: 'geojson',
				data: geojson,
				generateId: true
			});

			// Main destination circles colored by category
			this.map.addLayer({
				id: 'destination-layer',
				type: 'circle',
				source: 'destination-source',
				paint: {
					'circle-color': [
						'match',
						['get', 'category'],
						'school',
						'#C88534',
						'health',
						'#A64535',
						'#666666'
					],
					'circle-radius': 8,
					'circle-stroke-width': 2,
					'circle-stroke-color': '#ffffff',
					'circle-opacity': 1,
					'circle-stroke-opacity': 1
				}
			});

			// Hover/highlight layer
			this.map.addLayer({
				id: 'destination-hover-layer',
				type: 'circle',
				source: 'destination-source',
				paint: {
					'circle-color': [
						'match',
						['get', 'category'],
						'school',
						'#C88534',
						'health',
						'#A64535',
						'#666666'
					],
					'circle-radius': 12,
					'circle-stroke-width': 3,
					'circle-stroke-color': '#ffffff',
					'circle-opacity': 1,
					'circle-stroke-opacity': 1
				},
				filter: ['==', ['id'], -1]
			});

			// Labels
			this.map.addLayer({
				id: 'destination-labels',
				type: 'symbol',
				source: 'destination-source',
				layout: {
					'text-field': ['get', 'name'],
					'text-size': 11,
					'text-offset': [0, 1.5],
					'text-anchor': 'top',
					'text-optional': true
				},
				paint: {
					'text-color': '#333333',
					'text-halo-color': '#ffffff',
					'text-halo-width': 2
				}
			});
		} catch (error) {
			console.error('Error initializing destination layers:', error);
		}
	}

	handleDestinationHover(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['destination-layer', 'destination-hover-layer'].filter((l) =>
				this.map.getLayer(l)
			)
		});

		if (features.length > 0) {
			this.map.getCanvas().style.cursor = 'pointer';

			if (zambiaMapState.filterMode) return;

			this.map.setFilter('destination-hover-layer', ['==', ['id'], features[0].id]);
		} else {
			this.map.getCanvas().style.cursor = '';

			if (zambiaMapState.filterMode) return;

			this.map.setFilter('destination-hover-layer', ['==', ['id'], -1]);
		}
	}

	handleDestinationClick(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['destination-layer', 'destination-hover-layer'].filter((l) =>
				this.map.getLayer(l)
			)
		});

		if (!features.length) return;

		const feature = features[0];
		const props = feature.properties;

		const h3Indices = parsePgArray(props.h3_indices);
		const bridgesUsed = parsePgArrayNum(props.bridges_used);

		// Get destination index based on category
		const destIndex =
			props.category === 'school'
				? props.all_education_facilities_index
				: props.all_health_facilities_index;

		// Update state
		zambiaMapState.selectedDestinationData = feature;
		zambiaMapState.filterMode = true;
		zambiaMapState.clickedFeatureType = 'destination';
		zambiaMapState.highlightedHexes = h3Indices;
		zambiaMapState.highlightedBridges = bridgesUsed;

		// Apply visual filtering
		this.highlightSelectedDestination(feature.id);

		if (this.hexLayerManager) {
			this.hexLayerManager.highlightHexes(h3Indices);
		}

		if (this.bridgeLayerManager) {
			this.bridgeLayerManager.highlightBridges(bridgesUsed);
		}

		// Show paths to this destination
		if (this.pathLayerManager && destIndex) {
			this.pathLayerManager.displayPathsToDestination(destIndex);
			zambiaMapState.pathsVisible = true;
		}
	}

	highlightDestinations(destIndices) {
		if (
			!this.map.getLayer('destination-layer') ||
			!destIndices ||
			destIndices.length === 0
		)
			return;

		// Build filter matching either education or health facility index
		const checks = destIndices.flatMap((idx) => [
			['==', ['get', 'all_education_facilities_index'], idx],
			['==', ['get', 'all_health_facilities_index'], idx]
		]);

		const highlightFilter = ['any', ...checks];

		this.map.setPaintProperty('destination-layer', 'circle-opacity', [
			'case',
			highlightFilter,
			1.0,
			0.2
		]);
		this.map.setPaintProperty('destination-layer', 'circle-stroke-opacity', [
			'case',
			highlightFilter,
			1.0,
			0.2
		]);
	}

	highlightSelectedDestination(featureId) {
		if (!this.map.getLayer('destination-layer')) return;

		const selectFilter = ['==', ['id'], featureId];

		this.map.setPaintProperty('destination-layer', 'circle-opacity', [
			'case',
			selectFilter,
			1.0,
			0.3
		]);
		this.map.setPaintProperty('destination-layer', 'circle-stroke-opacity', [
			'case',
			selectFilter,
			1.0,
			0.3
		]);

		this.map.setFilter('destination-hover-layer', selectFilter);
	}

	resetFilter() {
		if (!this.map.getLayer('destination-layer')) return;

		this.map.setPaintProperty('destination-layer', 'circle-opacity', 1.0);
		this.map.setPaintProperty('destination-layer', 'circle-stroke-opacity', 1.0);
		this.map.setFilter('destination-hover-layer', ['==', ['id'], -1]);
	}
}
