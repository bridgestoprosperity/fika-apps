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

export class PathLayerManager {
	constructor(map) {
		this.map = map;
		this.allPaths = null;
	}

	async initialize() {
		if (!this.map) {
			console.warn('Map not available for initializing path layers');
			return;
		}

		try {
			// Load all paths from S3
			const response = await fetch(`${S3_BASE}/paths_itezhitezhi.geojson`);
			this.allPaths = await response.json();

			// Add empty source
			this.map.addSource('path-source', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: []
				}
			});

			// Path line layer
			this.map.addLayer(
				{
					id: 'path-layer',
					type: 'line',
					source: 'path-source',
					layout: {
						'line-cap': 'square',
						'line-round-limit': 1
					},
					paint: {
						'line-color': [
							'case',
							['==', ['get', 'path_type'], 'education'],
							'#C88534',
							['==', ['get', 'path_type'], 'health'],
							'#A64535',
							'#FF6B6B'
						],
						'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.1, 15, 3],
						'line-dasharray': [0.2, 2],
						'line-offset': [
							'case',
							['==', ['get', 'path_type'], 'health'],
							2,
							['==', ['get', 'path_type'], 'education'],
							0,
							-1
						]
					}
				},
				'waterway'
			);
		} catch (error) {
			console.error('Error initializing path layers:', error);
		}
	}

	displayPathsFromHex(h3Index) {
		if (!this.allPaths || !this.map.getSource('path-source')) return;

		const filteredFeatures = this.allPaths.features.filter(
			(f) => f.properties.h3_index === h3Index
		);

		this.map.getSource('path-source').setData({
			type: 'FeatureCollection',
			features: filteredFeatures
		});

		zambiaMapState.pathsVisible = true;
	}

	displayPathsToDestination(destIndex) {
		if (!this.allPaths || !this.map.getSource('path-source')) return;

		// destination_index may be numeric or string, compare loosely
		const destIndexNum = Number(destIndex);
		const filteredFeatures = this.allPaths.features.filter((f) => {
			const pathDest = Number(f.properties.destination_index);
			return pathDest === destIndexNum;
		});

		this.map.getSource('path-source').setData({
			type: 'FeatureCollection',
			features: filteredFeatures
		});

		zambiaMapState.pathsVisible = true;
	}

	displayPathsForBridge(bridgeIndex, bridgeData) {
		if (!this.allPaths || !this.map.getSource('path-source') || !bridgeData) return;

		// Find the bridge and get its served hexes
		const bridge = bridgeData.features.find(
			(f) => f.properties.bridge_index === bridgeIndex
		);

		if (!bridge) return;

		const allHexes = new Set();
		Object.keys(bridge.properties).forEach((key) => {
			if (key.startsWith('used_by_h3_for_')) {
				parsePgArray(bridge.properties[key]).forEach((h) => allHexes.add(h));
			}
		});

		const filteredFeatures = this.allPaths.features.filter((f) =>
			allHexes.has(f.properties.h3_index)
		);

		this.map.getSource('path-source').setData({
			type: 'FeatureCollection',
			features: filteredFeatures
		});

		zambiaMapState.pathsVisible = true;
	}

	clearPaths() {
		if (!this.map.getSource('path-source')) return;

		this.map.getSource('path-source').setData({
			type: 'FeatureCollection',
			features: []
		});

		zambiaMapState.pathsVisible = false;
	}
}
