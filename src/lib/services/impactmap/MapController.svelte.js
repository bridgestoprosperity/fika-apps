// src/lib/services/map/MapController.svelte.js
import mapboxgl from 'mapbox-gl';
import { impactMapState } from '$lib/utils/state.svelte';
import { HexLayerManager } from './HexLayerManager.svelte.js';
import { RasterLayerManager } from './RasterLayerManager.svelte.js';
import { BridgeLayerManager } from './BridgeLayerManager.svelte.js';
import { HealthLayerManager } from './HealthLayerManager.svelte.js';
import { EduLayerManager } from './EduLayerManager.svelte.js';

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
	healthLayerManager = null;
	eduLayerManager = null;

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
		this.rasterLayerManager = new RasterLayerManager(this.map);
		this.bridgeLayerManager = new BridgeLayerManager(this.map);
		this.healthLayerManager = new HealthLayerManager(this.map);
		this.eduLayerManager = new EduLayerManager(this.map);

		// Initialize hex layer manager with references to other managers for filtering
		this.hexLayerManager = new HexLayerManager(this.map, {
			bridgeLayerManager: this.bridgeLayerManager,
			healthLayerManager: this.healthLayerManager,
			eduLayerManager: this.eduLayerManager
		});

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

			// Initialize health layers
			await this.healthLayerManager.initialize();

			// Initialize education layers
			await this.eduLayerManager.initialize();

			// Initial setup once style is loaded
			if (impactMapState.dataMapKey) {
				setTimeout(() => this.updateLayers(), 100);
			}
			// Setup click handlers
			this.map.on('click', 'hex-layer', (e) => {
				this.hexLayerManager.handleHexClick(e);
			});

			// Reset filters when clicking outside of hex areas
			this.map.on('click', (e) => {
				// Check if we're clicking on a hex
				const hexFeatures = this.map.queryRenderedFeatures(e.point, {
					layers: ['hex-layer']
				});

				// If no hex was clicked and we're in filter mode, reset filters
				if (hexFeatures.length === 0 && impactMapState.filterMode) {
					this.hexLayerManager.resetInfrastructureFilter();
				}
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

			// Setup click handlers for health facilities
			this.map.on('click', 'health-layer', (e) => {
				this.healthLayerManager.handleHealthClick(e);
			});

			this.map.on('click', 'health-hover-layer', (e) => {
				this.healthLayerManager.handleHealthClick(e);
			});

			// Setup hover handlers for health facilities (both base and hover layers)
			this.map.on('mousemove', 'health-layer', (e) => {
				this.healthLayerManager.handleHealthHover(e);
			});

			this.map.on('mousemove', 'health-hover-layer', (e) => {
				this.healthLayerManager.handleHealthHover(e);
			});

			this.map.on('mouseleave', 'health-layer', (e) => {
				this.healthLayerManager.handleHealthHover(e);
			});

			this.map.on('mouseleave', 'health-hover-layer', (e) => {
				this.healthLayerManager.handleHealthHover(e);
			});

			// Setup click handlers for education facilities
			this.map.on('click', 'edu-layer', (e) => {
				this.eduLayerManager.handleEduClick(e);
			});

			this.map.on('click', 'edu-hover-layer', (e) => {
				this.eduLayerManager.handleEduClick(e);
			});

			// Setup hover handlers for education facilities (both base and hover layers)
			this.map.on('mousemove', 'edu-layer', (e) => {
				this.eduLayerManager.handleEduHover(e);
			});

			this.map.on('mousemove', 'edu-hover-layer', (e) => {
				this.eduLayerManager.handleEduHover(e);
			});

			this.map.on('mouseleave', 'edu-layer', (e) => {
				this.eduLayerManager.handleEduHover(e);
			});

			this.map.on('mouseleave', 'edu-hover-layer', (e) => {
				this.eduLayerManager.handleEduHover(e);
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
