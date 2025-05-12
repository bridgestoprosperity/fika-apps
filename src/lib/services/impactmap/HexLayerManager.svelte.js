import { impactDataMap } from '$lib/utils/impactmap/impactDataMap';
import { ColorUtils } from './ColorUtils.svelte.js';

export class HexLayerManager {
	constructor(map) {
		this.map = map;
		this.colorUtils = new ColorUtils();
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

			// Add hex8 fill layer (for zoom 7.5+)
			this.map.addLayer({
				id: 'hex-layer',
				type: 'fill',
				source: 'hex-source',
				'source-layer': 'hex8-impact-data-no-pop', // Make sure this matches your tileset's source layer name
				minzoom: 0,
				maxzoom: 22,
				paint: {
					'fill-color': hexColorExpression,
					'fill-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 8.2, 0.8]
				}
			});

			console.log('Hex layers initialized successfully');
		} catch (error) {
			console.error('Error initializing hex layers:', error);
		}
	}

	updateLayer(dataKey) {
		if (!dataKey || !impactDataMap[dataKey]) {
			console.warn('Invalid data key for hex layer:', dataKey);
			return;
		}

		// Define the tilesets and their corresponding data keys
		const tilesets = {
			'mapbox://bridgestoprosperity.hex8-demographic': [
				'population',
				'births',
				'pregnancies',
				'rwi',
				'underweight',
				'female_educational_attainment_mean',
				'male_educational_attainment_mean'
			],
			'mapbox://bridgestoprosperity.hex8-travel-time': [
				// Fixed the URL
				'travel_time_no_sites_all_health',
				'travel_time_health_posts',
				'travel_time_major_roads',
				'travel_time_no_sites_secondary_schools',
				'travel_time_secondary_schools',
				'travel_time_no_sites_health_centers',
				'travel_time_no_sites_major_roads',
				'travel_time_health_centers',
				'travel_time_semi_dense_urban',
				'travel_time_all_health',
				'travel_time_no_sites_primary_schools',
				'travel_time_no_sites_semi_dense_urban',
				'travel_time_no_sites_all_education',
				'travel_time_major_hospitals',
				'travel_time_no_sites_major_hospitals',
				'travel_time_primary_schools',
				'travel_time_no_sites_health_posts',
				'travel_time_all_education'
			],
			'mapbox://bridgestoprosperity.hex8-time-delta': [
				// Fixed the URL
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
		};

		// Find which tileset contains this dataKey
		let hexSource = null;
		for (const [url, dataKeys] of Object.entries(tilesets)) {
			if (dataKeys.includes(dataKey)) {
				hexSource = url;
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

			console.log('Added new source with URL:', hexSource);

			// Determine the correct source-layer name based on the tileset
			let sourceLayer = 'hex8-impact-data-no-pop'; // default

			// You may need to adjust these based on your actual tileset layer names
			// if (hexSource.includes('demographic')) {
			// 	sourceLayer = 'hex8-demographic'; // or whatever the actual layer name is
			// } else if (hexSource.includes('travel-time')) {
			// 	sourceLayer = 'hex8-travel-time'; // or whatever the actual layer name is
			// } else if (hexSource.includes('time-delta')) {
			// 	sourceLayer = 'hex8-time-delta'; // or whatever the actual layer name is
			// }

			// Add the layer
			this.map.addLayer({
				id: 'hex-layer',
				type: 'fill',
				source: 'hex-source',
				'source-layer': sourceLayer,
				minzoom: 0,
				maxzoom: 22,
				paint: {
					'fill-color': this.colorUtils.getHexColorExpression(dataKey),
					'fill-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 8.2, 0.8]
				}
			});

			console.log(`Added hex layer with source-layer: ${sourceLayer}`);
		} else {
			console.log('Updating existing hex layer color');
			// Just update the paint property
			this.map.setPaintProperty(
				'hex-layer',
				'fill-color',
				this.colorUtils.getHexColorExpression(dataKey)
			);
		}
	}

	cleanupExistingLayer() {
		if (this.map.getLayer('hex-layer')) {
			console.log('Removing existing raster layer');
			this.map.removeLayer('hex-layer');
		}

		if (this.map.getSource('hex-source')) {
			console.log('Removing existing raster source');
			this.map.removeSource('hex-source');
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
		console.log('Hex layer paint values:', paintValues);
	}
}
