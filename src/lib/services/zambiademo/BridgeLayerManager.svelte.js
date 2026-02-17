import bridgeIcon from '$lib/images/map-icons/bridge-icon-bubble.png';
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

export class BridgeLayerManager {
	constructor(map, hexLayerManager = null) {
		this.map = map;
		this.hexLayerManager = hexLayerManager;
		this.pathLayerManager = null;
		this.bridgeData = null;
	}

	async initialize() {
		if (!this.map) {
			console.warn('Map not available for initializing bridge layers');
			return;
		}

		try {
			const response = await fetch(`${S3_BASE}/bridges_itezhitezhi.geojson`);
			const geojson = await response.json();
			this.bridgeData = geojson;

			this.map.addSource('bridge-source', {
				type: 'geojson',
				data: geojson,
				generateId: true
			});

			// Load bridge icon
			this.map.loadImage(bridgeIcon, (error, image) => {
				if (error) {
					console.error('Error loading bridge icon:', error);
					return;
				}

				if (!this.map.hasImage('bridge-icon-bubble')) {
					this.map.addImage('bridge-icon-bubble', image);
				}

				// Main icon layer - always shows pins
				this.map.addLayer({
					id: 'bridge-layer',
					type: 'symbol',
					source: 'bridge-source',
					layout: {
						'icon-image': 'bridge-icon-bubble',
						'icon-size': [
							'interpolate',
							['exponential', 1.5],
							['zoom'],
							8,
							0.05,
							14.5,
							0.1
						],
						'icon-allow-overlap': true,
						'icon-ignore-placement': true
					},
					paint: {
						'icon-opacity': 1,
						'icon-translate': [0, 5]
					}
				});

				// Hover layer - hidden by default, used for click detection on highlighted bridges
				this.map.addLayer({
					id: 'bridge-hover-layer',
					type: 'symbol',
					source: 'bridge-source',
					layout: {
						'icon-image': 'bridge-icon-bubble',
						'icon-size': [
							'interpolate',
							['exponential', 1.5],
							['zoom'],
							8,
							0.05,
							14.5,
							0.1
						],
						'icon-allow-overlap': true,
						'icon-ignore-placement': true
					},
					paint: {
						'icon-opacity': 1,
						'icon-translate': [0, 5]
					},
					filter: ['==', ['get', 'bridge_index'], '']
				});
			});
		} catch (error) {
			console.error('Error initializing bridge layers:', error);
		}
	}

	handleBridgeHover(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['bridge-layer', 'bridge-hover-layer'].filter((l) => this.map.getLayer(l))
		});

		if (features.length > 0) {
			this.map.getCanvas().style.cursor = 'pointer';
		} else {
			this.map.getCanvas().style.cursor = '';
		}
	}

	handleBridgeClick(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['bridge-layer', 'bridge-hover-layer'].filter((l) => this.map.getLayer(l))
		});

		if (!features.length) return;

		const feature = features[0];
		const props = feature.properties;
		const bridgeIndex = props.bridge_index;

		// Parse hex indices from all used_by_h3_for_* fields
		const allHexes = new Set();
		Object.keys(props).forEach((key) => {
			if (key.startsWith('used_by_h3_for_')) {
				parsePgArray(props[key]).forEach((h) => allHexes.add(h));
			}
		});

		const healthDests = parsePgArrayNum(props.health_destinations);
		const eduDests = parsePgArrayNum(props.edu_destinations);

		// Update state
		zambiaMapState.selectedBridgeData = feature;
		zambiaMapState.filterMode = true;
		zambiaMapState.clickedFeatureType = 'bridge';
		zambiaMapState.dataPanelOpen = true;
		zambiaMapState.highlightedHexes = Array.from(allHexes);
		zambiaMapState.highlightedDestinations = [...healthDests, ...eduDests];

		// Apply visual filtering
		this.highlightSelectedBridge(bridgeIndex);

		if (this.hexLayerManager) {
			this.hexLayerManager.highlightHexes(Array.from(allHexes));
		}

		if (this.destinationLayerManager) {
			this.destinationLayerManager.highlightDestinations([...healthDests, ...eduDests]);
		}

		// Show paths for hexes that use this bridge
		if (this.pathLayerManager) {
			this.pathLayerManager.displayPathsForBridge(bridgeIndex, this.bridgeData);
			zambiaMapState.pathsVisible = true;
		}
	}

	highlightBridges(bridgeIds) {
		if (!this.map.getLayer('bridge-layer') || !bridgeIds || bridgeIds.length === 0) return;

		let highlightFilter;
		if (bridgeIds.length === 1) {
			highlightFilter = ['==', ['get', 'bridge_index'], bridgeIds[0]];
		} else {
			highlightFilter = [
				'any',
				...bridgeIds.map((id) => ['==', ['get', 'bridge_index'], id])
			];
		}

		// Fade non-highlighted bridges
		this.map.setPaintProperty('bridge-layer', 'icon-opacity', [
			'case',
			highlightFilter,
			1,
			0.2
		]);
	}

	highlightSelectedBridge(bridgeIndex) {
		if (!this.map.getLayer('bridge-layer')) return;

		const selectFilter = ['==', ['get', 'bridge_index'], bridgeIndex];

		// Fade non-selected bridges
		this.map.setPaintProperty('bridge-layer', 'icon-opacity', [
			'case',
			selectFilter,
			1,
			0.3
		]);
	}

	resetFilter() {
		if (!this.map.getLayer('bridge-layer')) return;

		this.map.setPaintProperty('bridge-layer', 'icon-opacity', 1);
	}
}
