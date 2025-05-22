// src/lib/services/map/MapController.svelte.js
import mapboxgl from 'mapbox-gl';
import { impactMapState } from '$lib/utils/state.svelte';
import { HexLayerManager } from './HexLayerManager.svelte.js';
import { RasterLayerManager } from './RasterLayerManager.svelte.js';
import { BridgeLayerManager } from './BridgeLayerManager.svelte.js';

export class MapController {
	// Initialize state as class fields
	mapLoaded = $state(false);
	styleLoaded = $state(false);
	currentDataKey = $state('');

	// Map instance
	map = null;

	// Layer managers
	hexLayerManager = null;
	rasterLayerManager = null;
	bridgeLayerManager = null;

	constructor(container) {
		// Initialize map
		console.log('Initializing MapController');
		mapboxgl.accessToken =
			'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTVyaGcweGswYWpzMnhxMjRyZHhtMGh0In0.4YOL9xCKxxQ0u2wZ7AlNMg';

		this.map = new mapboxgl.Map({
			container: container,
			style: 'mapbox://styles/bridgestoprosperity/cm8nlprgt001j01snclz4henr',
			center: [26.19, -0.21],
			zoom: 3,
			hash: true
		});

		// Setup layer managers
		this.hexLayerManager = new HexLayerManager(this.map);
		this.rasterLayerManager = new RasterLayerManager(this.map);
		this.bridgeLayerManager = new BridgeLayerManager(this.map);

		// Setup event handlers
		this.setupEventHandlers();

		// Setup reactivity
		this.setupReactivity();
	}

	get mapReady() {
		return this.mapLoaded && this.styleLoaded;
	}

	setupEventHandlers() {
		// Track when map loads
		this.map.on('load', () => {
			console.log('Map loaded');
			this.mapLoaded = true;
		});

		// Track when style loads
		this.map.on('style.load', async () => {
			console.log('Style loaded');
			this.styleLoaded = true;

			// Initialize hex layers first
			await this.hexLayerManager.initialize();

			// Initialize bridge layers
			await this.bridgeLayerManager.initialize();

			// Initial setup once style is loaded
			if (impactMapState.dataMapKey) {
				setTimeout(() => this.updateLayers(), 100);
			}
			// Setup click handlers
			this.map.on('click', 'hex-layer', (e) => {
				this.hexLayerManager.handleHexClick(e);
			});

			// Setup hover handlers for hex
			this.map.on('mousemove', 'hex-layer', (e) => {
				this.hexLayerManager.handleHexHover(e);
			});

			this.map.on('mouseleave', 'hex-layer', (e) => {
				this.hexLayerManager.handleHexHover(e);
			});

			this.map.on('click', 'bridge-layer', (e) => {
				this.bridgeLayerManager.handleBridgeClick(e);
			});

			this.map.on('click', 'bridge-hover-layer', (e) => {
				this.bridgeLayerManager.handleBridgeClick(e);
			});

			// Setup hover handlers for bridges (both base and hover layers)
			this.map.on('mousemove', 'bridge-layer', (e) => {
				this.bridgeLayerManager.handleBridgeHover(e);
			});

			this.map.on('mousemove', 'bridge-hover-layer', (e) => {
				this.bridgeLayerManager.handleBridgeHover(e);
			});

			this.map.on('mouseleave', 'bridge-layer', (e) => {
				this.bridgeLayerManager.handleBridgeHover(e);
			});

			this.map.on('mouseleave', 'bridge-hover-layer', (e) => {
				this.bridgeLayerManager.handleBridgeHover(e);
			});
		});
	}

	setupReactivity() {
		// Log state changes for debugging
		$effect(() => {
			console.log(
				'Map tracking state change:',
				impactMapState.dataMapKey,
				'(current:',
				this.currentDataKey,
				')'
			);
		});

		// Watch for changes to impactMapState.dataMapKey
		$effect(() => {
			const dataKey = impactMapState.dataMapKey;

			// Only proceed if data key is valid and different from current
			if (dataKey && dataKey !== this.currentDataKey) {
				console.log('Data key changed to:', dataKey);

				// Update map if it's ready
				if (this.mapReady) {
					console.log('Map ready, updating visualization');
					// Use setTimeout to ensure this runs after current execution
					setTimeout(() => this.updateLayers(), 0);
				} else {
					console.log('Map not ready yet, update will happen when map loads');
				}
			}
		});
	}

	updateLayers() {
		const dataKey = impactMapState.dataMapKey;

		try {
			console.log('Updating map visualization for dataKey:', dataKey);

			// Update hex layer
			this.hexLayerManager.updateLayer(dataKey);

			// Update raster layer
			this.rasterLayerManager.updateLayer(dataKey);

			// Update current data key to track changes
			this.currentDataKey = dataKey;
			console.log('Update complete, currentDataKey is now:', this.currentDataKey);
		} catch (error) {
			console.error('Error updating map visualization:', error);
		}
	}

	cleanup() {
		if (this.map) {
			console.log('Cleaning up map');
			this.map.remove();
		}
	}
}
