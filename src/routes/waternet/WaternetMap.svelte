<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import WaternetMapControls from './WaternetMapControls.svelte';
	import { waternetMapState } from '$lib/utils/state.svelte';
	import {
		createVectorLayer,
		createRasterLayer,
		createSatelliteLayer,
		getVectorLineColor,
		getRasterPaint
	} from '$lib/utils/mapLayers.svelte';

	let map;
	let mapContainer;

	let vectorVisibility = $derived(waternetMapState.visibility.vectorData ? 'visible' : 'none');
	let rasterVisibility = $derived(waternetMapState.visibility.rasterData ? 'visible' : 'none');
	let satelliteVisibility = $derived(
		waternetMapState.visibility.satelliteImagery ? 'visible' : 'none'
	);
	let satelliteSaturation = $derived(
		waternetMapState.style.satStyle === 'Black and White' ? -1 : 0
	);

	let layerStates = $derived({
		satellite: {
			visible: waternetMapState.visibility.satelliteImagery,
			saturation: waternetMapState.style.satStyle === 'Black and White' ? -1 : 0
		},
		vector: {
			visible: waternetMapState.visibility.vectorData,
			lineColor: getVectorLineColor(),
			threshold: 12 - waternetMapState.style.streamOrderThreshold
		},
		raster: {
			visible: waternetMapState.visibility.rasterData,
			paint: getRasterPaint()
		}
	});

	// Then update your updateLayerProperties function
	function updateLayerProperties() {
		if (!map) return;

		// Update satellite layer
		const satelliteLayer = map.getLayer('satellite-layer');
		if (satelliteLayer) {
			const currentVisibility = map.getLayoutProperty('satellite-layer', 'visibility');
			const shouldBeVisible = layerStates.satellite.visible ? 'visible' : 'none';

			if (currentVisibility !== shouldBeVisible) {
				map.setLayoutProperty('satellite-layer', 'visibility', shouldBeVisible);
			}
			map.setPaintProperty(
				'satellite-layer',
				'raster-saturation',
				layerStates.satellite.saturation
			);
		}

		// Update vector layer
		const vectorLayer = map.getLayer('vector-waternet');
		if (vectorLayer) {
			const currentVisibility = map.getLayoutProperty('vector-waternet', 'visibility');
			const shouldBeVisible = layerStates.vector.visible ? 'visible' : 'none';

			if (currentVisibility !== shouldBeVisible) {
				map.setLayoutProperty('vector-waternet', 'visibility', shouldBeVisible);
			}
			map.setPaintProperty('vector-waternet', 'line-color', layerStates.vector.lineColor);
			map.setFilter('vector-waternet', ['>', 'stream_order', layerStates.vector.threshold]);
		}

		// Update raster layer
		const rasterLayer = map.getLayer('raster-waternet');
		if (rasterLayer) {
			const currentVisibility = map.getLayoutProperty('raster-waternet', 'visibility');
			const shouldBeVisible = layerStates.raster.visible ? 'visible' : 'none';

			if (currentVisibility !== shouldBeVisible) {
				map.setLayoutProperty('raster-waternet', 'visibility', shouldBeVisible);
			}
			Object.entries(layerStates.raster.paint).forEach(([key, value]) => {
				map.setPaintProperty('raster-waternet', key, value);
			});
		}
	}

	$effect(() => {
		// Track all the properties that should trigger an update
		const _ = [
			waternetMapState.visibility.vectorData,
			waternetMapState.visibility.rasterData,
			waternetMapState.visibility.satelliteImagery,
			waternetMapState.style.satStyle,
			waternetMapState.style.selectedPalette,
			waternetMapState.style.vectorStyle,
			waternetMapState.style.streamOrderThreshold
		];
		updateLayerProperties();
	});

	function initializeLayers(pmtilesUrl, header, bounds) {
		if (!map) return;

		if (!map.getLayer('satellite-layer')) {
			map.addLayer(createSatelliteLayer());
		}

		if (!map.getLayer('raster-waternet')) {
			map.addLayer(createRasterLayer());
		}

		if (!map.getSource('waterways')) {
			map.addSource('waterways', {
				type: PmTilesSource.SOURCE_TYPE,
				url: pmtilesUrl,
				minzoom: header.minZoom,
				maxzoom: header.maxZoom,
				bounds: bounds
			});
		}

		if (!map.getLayer('vector-waternet')) {
			map.addLayer(createVectorLayer());
		}

		updateLayerProperties();
	}

	onMount(() => {
		mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource);

		mapboxgl.accessToken =
			'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTJ1d2Rka3cwNTM5MmxxMWExZmo2OG1tIn0.B6fDwi43tGjtDzyFSrncxQ';
		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/bridgestoprosperity/cm4kippxv01k101slb7hs8mvr',
			center: [26.19, -0.21],
			zoom: 4,
			hash: true
		});

		map.on('load', async () => {
			const nav = new mapboxgl.NavigationControl({
				visualizePitch: true
			});
			map.addControl(nav, 'bottom-right');
			try {
				const PMTILES_URL =
					'https://data.source.coop/fika/waternet/pmtiles/waterway_model_outputs_20m_vector.pmtiles';
				const header = await PmTilesSource.getHeader(PMTILES_URL);
				const bounds = [header.minLon, header.minLat, header.maxLon, header.maxLat];
				initializeLayers(PMTILES_URL, header, bounds);
			} catch (error) {
				console.error('Error initializing layers:', error);
			}
		});
		// on hover over wateways layer console log stream order
		map.on('mousemove', 'vector-waternet', (e) => {
			console.log(e.features[0].properties.stream_order);
			// change mouse to cross hair
			map.getCanvas().style.cursor = 'crosshair';
			// update mapState.streamOrder
			waternetMapState.style.streamOrderValue = e.features[0].properties.stream_order;
		});
		map.on('mouseleave', 'vector-waternet', () => {
			waternetMapState.style.streamOrderValue = '';
			map.getCanvas().style.cursor = '';
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={mapContainer} class="absolute inset-0 h-full w-full"></div>
</div>
