import mapboxgl from 'mapbox-gl';
import { zambiaMapState } from '$lib/utils/state.svelte';
import { HexLayerManager } from './HexLayerManager.svelte.js';
import { BridgeLayerManager } from './BridgeLayerManager.svelte.js';
import { DestinationLayerManager } from './DestinationLayerManager.svelte.js';
import { PathLayerManager } from './PathLayerManager.svelte.js';

export class MapController {
	mapLoaded = $state(false);
	styleLoaded = $state(false);
	currentMetric = $state('');

	map = null;

	hexLayerManager = null;
	bridgeLayerManager = null;
	destinationLayerManager = null;
	pathLayerManager = null;

	constructor(container) {
		mapboxgl.accessToken =
			'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTVyaGcweGswYWpzMnhxMjRyZHhtMGh0In0.4YOL9xCKxxQ0u2wZ7AlNMg';

		this.map = new mapboxgl.Map({
			container: container,
			style: 'mapbox://styles/bridgestoprosperity/cm8nlprgt001j01snclz4henr',
			center: [26.0, -15.75],
			zoom: 11,
			hash: true
		});

		// Initialize layer managers
		this.hexLayerManager = new HexLayerManager(this.map);
		this.pathLayerManager = new PathLayerManager(this.map);
		this.bridgeLayerManager = new BridgeLayerManager(this.map, this.hexLayerManager);
		this.destinationLayerManager = new DestinationLayerManager(this.map, this.hexLayerManager);

		// Set cross-references
		this.hexLayerManager.bridgeLayerManager = this.bridgeLayerManager;
		this.hexLayerManager.destinationLayerManager = this.destinationLayerManager;
		this.hexLayerManager.pathLayerManager = this.pathLayerManager;

		this.bridgeLayerManager.destinationLayerManager = this.destinationLayerManager;
		this.bridgeLayerManager.pathLayerManager = this.pathLayerManager;

		this.destinationLayerManager.bridgeLayerManager = this.bridgeLayerManager;
		this.destinationLayerManager.pathLayerManager = this.pathLayerManager;

		this.setupEventHandlers();
		this.setupReactivity();
	}

	get mapReady() {
		return this.mapLoaded && this.styleLoaded;
	}

	setupEventHandlers() {
		this.map.on('load', () => {
			this.mapLoaded = true;
		});

		this.map.on('style.load', async () => {
			this.styleLoaded = true;

			const nav = new mapboxgl.NavigationControl({ visualizePitch: true });
			this.map.addControl(nav, 'bottom-right');

			// Initialize layers in order (hex first, then paths below other layers, then points on top)
			await this.hexLayerManager.initialize();
			await this.pathLayerManager.initialize();
			await this.bridgeLayerManager.initialize();
			await this.destinationLayerManager.initialize();

			// Global click handler with priority: destination > bridge > hex > empty
			this.map.on('click', (e) => {
				const destFeatures = this.map.queryRenderedFeatures(e.point, {
					layers: ['destination-layer', 'destination-hover-layer'].filter((l) =>
						this.map.getLayer(l)
					)
				});

				if (destFeatures.length > 0) {
					this.destinationLayerManager.handleDestinationClick(e);
					return;
				}

				const bridgeFeatures = this.map.queryRenderedFeatures(e.point, {
					layers: ['bridge-layer', 'bridge-hover-layer'].filter((l) =>
						this.map.getLayer(l)
					)
				});

				if (bridgeFeatures.length > 0) {
					this.bridgeLayerManager.handleBridgeClick(e);
					return;
				}

				const hexFeatures = this.map.queryRenderedFeatures(e.point, {
					layers: ['hex-layer'].filter((l) => this.map.getLayer(l))
				});

				if (hexFeatures.length > 0) {
					this.hexLayerManager.handleHexClick(e);
				} else if (zambiaMapState.filterMode) {
					this.hexLayerManager.resetFilters();
				}
			});

			// Hover handlers
			this.map.on('mousemove', 'hex-layer', (e) => {
				this.hexLayerManager.handleHexHover(e);
			});
			this.map.on('mouseleave', 'hex-layer', (e) => {
				this.hexLayerManager.handleHexHover(e);
			});

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

			this.map.on('mousemove', 'destination-layer', (e) => {
				this.destinationLayerManager.handleDestinationHover(e);
			});
			this.map.on('mousemove', 'destination-hover-layer', (e) => {
				this.destinationLayerManager.handleDestinationHover(e);
			});
			this.map.on('mouseleave', 'destination-layer', (e) => {
				this.destinationLayerManager.handleDestinationHover(e);
			});
			this.map.on('mouseleave', 'destination-hover-layer', (e) => {
				this.destinationLayerManager.handleDestinationHover(e);
			});
		});
	}

	setupReactivity() {
		$effect(() => {
			const metric = zambiaMapState.selectedMetric;

			if (metric && metric !== this.currentMetric) {
				if (this.mapReady) {
					setTimeout(() => {
						this.hexLayerManager.updateLayer(metric);
						this.currentMetric = metric;
					}, 0);
				}
			}
		});
	}

	cleanup() {
		if (this.map) {
			this.map.remove();
		}
	}
}
