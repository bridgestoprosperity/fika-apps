import { impactDataMap } from '$lib/utils/impactmap/impactDataMap';
import { ColorUtils } from './ColorUtils.svelte.js';

export class RasterLayerManager {
	constructor(map) {
		this.map = map;
		this.colorUtils = new ColorUtils();
	}
	
	updateLayer(dataKey) {
		if (!dataKey || !impactDataMap[dataKey]) {
			console.warn('Invalid data key for raster layer:', dataKey);
			return;
		}
		
		// Remove existing layer and source if they exist
		this.cleanupExistingLayer();
		
		// Add new source and layer
		const tileUrl = this.getTileUrl(dataKey);
		if (!tileUrl) {
			console.warn('No valid tile URL');
			return;
		}
		
		// Add new source
		console.log('Adding source with URL:', tileUrl);
		this.map.addSource('raster-source', {
			type: 'raster',
			tiles: [tileUrl],
			tileSize: 256,
			scheme: 'tms',
			minzoom: 0,
			maxzoom: 10
		});
		
		// Get raster color expression
		const colorExpression = this.colorUtils.getRasterColorExpression(dataKey);
		if (!colorExpression) {
			console.warn('No valid raster color expression');
			return;
		}
		
		// Add new layer
		console.log('Adding raster layer');
		this.map.addLayer({
			id: 'raster-layer',
			type: 'raster',
			source: 'raster-source',
			minzoom: 0,
			maxzoom: 22,
			paint: {
				'raster-color': colorExpression,
				'raster-color-mix': [255, 0, 0, 0],
				'raster-color-range': [0, 255],
				'raster-opacity': ['interpolate', ['linear'], ['zoom'], 0, .8, 8, 0.8, 8.2, 0]
			}
		});
	}
	
	cleanupExistingLayer() {
		if (this.map.getLayer('raster-layer')) {
			console.log('Removing existing raster layer');
			this.map.removeLayer('raster-layer');
		}
		
		if (this.map.getSource('raster-source')) {
			console.log('Removing existing raster source');
			this.map.removeSource('raster-source');
		}
	}
	
	getTileUrl(dataKey) {
		if (!impactDataMap[dataKey]) return null;
		
		const dataName = impactDataMap[dataKey].meta_info.data_name;
		const baseUrl = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/impact-map-raster-tiles/';
		const url = `${baseUrl}all_countries_merged_hex8_${dataName}/{z}/{x}/{y}.png`;
		
		console.log('Tile URL:', url);
		return url;
	}
}