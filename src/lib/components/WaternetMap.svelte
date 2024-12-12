<script>
    import { onMount, onDestroy } from 'svelte';
    import mapboxgl from 'mapbox-gl';
    import { PmTilesSource } from 'mapbox-pmtiles';
    import MapControls from './MapControls.svelte';
    import { mapState } from '$lib/stores/mapStore.svelte';
    import { 
        createVectorLayer, 
        createRasterLayer, 
        createSatelliteLayer,
        getVectorLineColor,
        getRasterPaint 
    } from '$lib/utils/mapLayers.svelte';

    let map;
    let mapContainer;

    let vectorVisibility = $derived(mapState.vectorData ? 'visible' : 'none');
    let rasterVisibility = $derived(mapState.rasterData ? 'visible' : 'none');
    let satelliteVisibility = $derived(mapState.satelliteImagery ? 'visible' : 'none');
    let satelliteSaturation = $derived(mapState.satStyle === 'Black and White' ? -1 : 0);
    

    function updateLayerProperties() {
        if (!map) return;

        if (map.getLayer('satellite-layer')) {
            map.setLayoutProperty('satellite-layer', 'visibility', satelliteVisibility);
            map.setPaintProperty('satellite-layer', 'raster-saturation', satelliteSaturation);
        }

        if (map.getLayer('vector-waternet')) {
            map.setLayoutProperty('vector-waternet', 'visibility', vectorVisibility);
            map.setPaintProperty('vector-waternet', 'line-color', getVectorLineColor());
        }

        if (map.getLayer('raster-waternet')) {
            map.setLayoutProperty('raster-waternet', 'visibility', rasterVisibility);
            const rasterPaint = getRasterPaint();
            Object.entries(rasterPaint).forEach(([key, value]) => {
                map.setPaintProperty('raster-waternet', key, value);
            });
        }
    }

    $effect(() => {
        // Track all the properties that should trigger an update
        const _ = [
            mapState.vectorData,
            mapState.rasterData,
            mapState.satelliteImagery,
            mapState.satStyle,
            mapState.selectedPalette,
            mapState.vectorStyle
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

        mapboxgl.accessToken = 'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTJ1d2Rka3cwNTM5MmxxMWExZmo2OG1tIn0.B6fDwi43tGjtDzyFSrncxQ';
        map = new mapboxgl.Map({
            container: mapContainer,
            style: 'mapbox://styles/bridgestoprosperity/cm4kippxv01k101slb7hs8mvr',
            center: [26.19, -0.21],
            zoom: 4,
            hash: true
        });

        map.on('load', async () => {
            try {
                const PMTILES_URL = 'https://data.source.coop/fika/waternet/pmtiles/waterway_model_outputs_20m_vector.pmtiles';
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
            mapState.streamOrder = e.features[0].properties.stream_order;
        });
        map.on('mouseleave', 'vector-waternet', () => {
            mapState.streamOrder = '';
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