import { zambiaDataMap } from '$lib/utils/zambiademo/zambiaDataMap';
import { ColorUtils } from './ColorUtils.svelte.js';
import { zambiaMapState } from '$lib/utils/state.svelte';

const S3_BASE = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/zambia-analysis-demo';

/**
 * Parse PostgreSQL array format "{val1,val2}" into a JS array of numbers.
 * Returns empty array for empty/null/whitespace-only values.
 */
function parsePgArray(str) {
	if (!str || typeof str !== 'string') return [];
	const cleaned = str.replace(/[{}]/g, '').trim();
	if (!cleaned) return [];
	return cleaned.split(',').map((s) => {
		const num = parseInt(s.trim(), 10);
		return isNaN(num) ? s.trim() : num;
	});
}

export class HexLayerManager {
	constructor(map) {
		this.map = map;
		this.colorUtils = new ColorUtils();
		this.hoverTimeout = null;
		this.currentHoveredId = null;

		// Will be set by MapController
		this.bridgeLayerManager = null;
		this.destinationLayerManager = null;
		this.pathLayerManager = null;
	}

	async initialize() {
		if (!this.map) {
			console.warn('Map not available for initializing hex layers');
			return;
		}

		try {
			const response = await fetch(`${S3_BASE}/hex_areas_itezhitezhi.geojson`);
			const geojson = await response.json();

			this.map.addSource('hex-source', {
				type: 'geojson',
				data: geojson,
				generateId: true
			});

			const hexColorExpression = this.colorUtils.getHexColorExpression();

			// Hex fill layer
			this.map.addLayer(
				{
					id: 'hex-layer',
					type: 'fill',
					source: 'hex-source',
					paint: {
						'fill-color': hexColorExpression,
						'fill-opacity': 0.7
					}
				},
				'waterway'
			);

			// Hex hover outline layer
			this.map.addLayer(
				{
					id: 'hex-hover-layer',
					type: 'line',
					source: 'hex-source',
					paint: {
						'line-color': '#A4EED0',
						'line-width': 3,
						'line-opacity': 1
					},
					filter: ['==', ['id'], -1]
				},
				'waterway'
			);
		} catch (error) {
			console.error('Error initializing hex layers:', error);
		}
	}

	updateLayer(metric) {
		if (!metric || !zambiaDataMap[metric]) {
			console.warn('Invalid metric for hex layer:', metric);
			return;
		}

		if (!this.map.getLayer('hex-layer')) return;

		this.map.setPaintProperty(
			'hex-layer',
			'fill-color',
			this.colorUtils.getHexColorExpression(metric)
		);
	}

	handleHexHover(e) {
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
			this.hoverTimeout = null;
		}

		// Check if bridge or destination features take priority
		const priorityFeatures = this.map.queryRenderedFeatures(e.point, {
			layers: ['bridge-layer', 'destination-layer'].filter((l) => this.map.getLayer(l))
		});

		if (priorityFeatures.length > 0) {
			this.currentHoveredId = null;
			this.map.setFilter('hex-hover-layer', ['==', ['id'], -1]);
			return;
		}

		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['hex-layer']
		});

		if (features.length > 0) {
			this.map.getCanvas().style.cursor = 'pointer';
			const featureId = features[0].id;

			if (featureId !== this.currentHoveredId) {
				this.hoverTimeout = setTimeout(() => {
					this.currentHoveredId = featureId;
					this.map.setFilter('hex-hover-layer', ['==', ['id'], featureId]);
				}, 50);
			}
		} else {
			this.map.getCanvas().style.cursor = '';
			this.currentHoveredId = null;
			this.map.setFilter('hex-hover-layer', ['==', ['id'], -1]);
		}
	}

	handleHexClick(e) {
		const features = this.map.queryRenderedFeatures(e.point, {
			layers: ['hex-layer']
		});

		if (!features.length) {
			if (zambiaMapState.filterMode) {
				this.resetFilters();
			}
			return;
		}

		const feature = features[0];
		const props = feature.properties;

		console.log('Hex clicked:', props.h3_index, props);

		// Parse bridge and destination references
		const bridgeIds = new Set();
		Object.keys(props).forEach((key) => {
			if (key.startsWith('bridges_used_for_')) {
				parsePgArray(props[key]).forEach((id) => bridgeIds.add(id));
			}
		});

		const healthDests = parsePgArray(props.health_destinations);
		const eduDests = parsePgArray(props.edu_destinations);

		// Update state
		zambiaMapState.selectedHexData = feature;
		zambiaMapState.filterMode = true;
		zambiaMapState.clickedFeatureType = 'hex';
		zambiaMapState.dataPanelOpen = true;
		zambiaMapState.highlightedBridges = Array.from(bridgeIds);
		zambiaMapState.highlightedDestinations = [...healthDests, ...eduDests];

		// Apply visual filtering
		this.highlightSelectedHex(props.h3_index);

		if (this.bridgeLayerManager) {
			this.bridgeLayerManager.highlightBridges(Array.from(bridgeIds));
		}

		if (this.destinationLayerManager) {
			this.destinationLayerManager.highlightDestinations([...healthDests, ...eduDests]);
		}

		// Show paths from this hex
		if (this.pathLayerManager) {
			this.pathLayerManager.displayPathsFromHex(props.h3_index);
			zambiaMapState.pathsVisible = true;
		}
	}

	highlightSelectedHex(h3Index) {
		if (!this.map.getLayer('hex-layer')) return;

		this.map.setPaintProperty('hex-layer', 'fill-opacity', [
			'case',
			['==', ['get', 'h3_index'], h3Index],
			0.6,
			0.2
		]);

		const originalColorExpression = this.colorUtils.getHexColorExpression(
			zambiaMapState.selectedMetric
		);
		this.map.setPaintProperty('hex-layer', 'fill-color', [
			'case',
			['==', ['get', 'h3_index'], h3Index],
			'#A4EED0',
			originalColorExpression
		]);
	}

	highlightHexes(h3Indices) {
		if (!this.map.getLayer('hex-layer') || !h3Indices || h3Indices.length === 0) return;

		const highlightFilter = ['match', ['get', 'h3_index'], h3Indices, true, false];

		this.map.setPaintProperty('hex-layer', 'fill-opacity', [
			'case',
			highlightFilter,
			0.8,
			0.1
		]);

		const originalColorExpression = this.colorUtils.getHexColorExpression(
			zambiaMapState.selectedMetric
		);
		this.map.setPaintProperty('hex-layer', 'fill-color', [
			'case',
			highlightFilter,
			originalColorExpression,
			'#cccccc'
		]);
	}

	resetFilters() {
		// Reset state
		zambiaMapState.selectedHexData = null;
		zambiaMapState.selectedBridgeData = null;
		zambiaMapState.selectedDestinationData = null;
		zambiaMapState.filterMode = false;
		zambiaMapState.clickedFeatureType = null;
		zambiaMapState.highlightedBridges = [];
		zambiaMapState.highlightedDestinations = [];
		zambiaMapState.highlightedHexes = [];
		zambiaMapState.pathsVisible = false;
		zambiaMapState.dataPanelOpen = false;

		// Reset hex styling
		this.resetHexHighlight();

		// Reset other layers
		if (this.bridgeLayerManager) {
			this.bridgeLayerManager.resetFilter();
		}

		if (this.destinationLayerManager) {
			this.destinationLayerManager.resetFilter();
		}

		if (this.pathLayerManager) {
			this.pathLayerManager.clearPaths();
		}
	}

	resetHexHighlight() {
		if (!this.map.getLayer('hex-layer')) return;

		this.map.setPaintProperty('hex-layer', 'fill-opacity', 0.7);
		this.map.setPaintProperty(
			'hex-layer',
			'fill-color',
			this.colorUtils.getHexColorExpression(zambiaMapState.selectedMetric)
		);
	}
}
