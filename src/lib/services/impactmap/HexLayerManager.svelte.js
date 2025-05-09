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

		// // There could be a source decider here maybe a 
		// let travelTime = ['travel_time_no_sites_all_health', 'travel_time_health_posts', 'travel_time_major_roads', 'travel_time_no_sites_secondary_schools', 'travel_time_secondary_schools', 'travel_time_no_sites_health_centers', 'travel_time_no_sites_major_roads', 'travel_time_health_centers', 'travel_time_semi_dense_urban', 'travel_time_all_health', 'travel_time_no_sites_primary_schools', 'travel_time_no_sites_semi_dense_urban', 'travel_time_no_sites_all_education', 'travel_time_major_hospitals', 'travel_time_no_sites_major_hospitals', 'travel_time_primary_schools', 'travel_time_no_sites_health_posts', 'travel_time_all_education'] 
		// let impact = ['time_delta_no_sites_all_education', 'time_delta_no_sites_semi_dense_urban', 'time_delta_no_sites_secondary_schools', 'time_delta_no_sites_all_health', 'time_delta_no_sites_health_centers', 'time_delta_no_sites_major_roads', 'time_delta_no_sites_major_hospitals', 'time_delta_no_sites_health_posts', 'time_delta_no_sites_primary_schools']
		
		// if (datakey in travelTime ) source_name == xyz
		// if (datakey in impact) layer_name ==

		const colorExpression = this.colorUtils.getHexColorExpression(dataKey);
		if (colorExpression) {
			this.map.setPaintProperty('hex-layer', 'fill-color', colorExpression);
		} else {
			console.warn('No valid hex color expression for hex layer');
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