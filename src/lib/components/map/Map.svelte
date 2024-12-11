<script lang="ts">
    import mapboxgl from 'mapbox-gl';
    import { PmTilesSource } from 'mapbox-pmtiles';
    import { onMount, onDestroy } from 'svelte';
    import { mapState } from '$lib/stores/map-state.svelte';
    import { createVectorLayer, createRasterLayer, createSatelliteLayer } from './mapStyles';
  
    const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTJ1d2Rka3cwNTM5MmxxMWExZmo2OG1tIn0.B6fDwi43tGjtDzyFSrncxQ';
    const PMTILES_URL = 'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/waternet-vector/waterway_model_outputs_20m_vector.pmtiles';
  
    let map: mapboxgl.Map;
    let mapContainer: HTMLDivElement;
  
    function updateMapLayers() {
      if (!map) return;
  
      try {
        ['vector-waternet', 'raster-waternet', 'satellite-layer'].forEach(layerId => {
          if (map.getLayer(layerId)) {
            const layer = {
              'vector-waternet': createVectorLayer(),
              'raster-waternet': createRasterLayer(),
              'satellite-layer': createSatelliteLayer()
            }[layerId];
  
            map.setLayoutProperty(layerId, 'visibility', layer.layout.visibility);
            Object.entries(layer.paint).forEach(([property, value]) => {
              map.setPaintProperty(layerId, property, value);
            });
          }
        });
      } catch (error) {
        console.error('Error updating map layers:', error);
      }
    }
  
    $effect(() => {
      const { vectorData, rasterData, satelliteImagery, selectedPalette, vectorStyle, satStyle } = mapState;
      if (map?.loaded()) updateMapLayers();
    });
  
    async function initializePMTiles() {
      const header = await PmTilesSource.getHeader(PMTILES_URL);
      const bounds = [header.minLon, header.minLat, header.maxLon, header.maxLat];
      
      if (!map.getSource('waterways')) {
        map.addSource('waterways', {
          type: PmTilesSource.SOURCE_TYPE,
          url: PMTILES_URL,
          minzoom: header.minZoom,
          maxzoom: header.maxZoom,
          bounds
        });
      }
    }
  
    function setupInitialLayers() {
      [createSatelliteLayer(), createRasterLayer(), createVectorLayer()].forEach(layer => {
        if (map.getLayer(layer.id)) map.removeLayer(layer.id);
        map.addLayer(layer);
      });
      updateMapLayers();
    }
  
    function setupMapInteractions() {
      map.on('mousemove', 'vector-waternet', (e) => {
        if (e.features?.[0]) {
          map.getCanvas().style.cursor = 'crosshair';
          mapState.streamOrder = e.features[0].properties.stream_order;
        }
      });
  
      map.on('mouseleave', 'vector-waternet', () => {
        map.getCanvas().style.cursor = '';
        mapState.streamOrder = 0;
      });
    }
  
    onMount(async () => {
      mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource);
      mapboxgl.accessToken = MAPBOX_TOKEN;
  
      map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/bridgestoprosperity/cm4kippxv01k101slb7hs8mvr',
        center: [26.19, -0.21],
        zoom: 4,
        hash: true
      });
  
      map.on('load', async () => {
        await initializePMTiles();
        setupInitialLayers();
        setupMapInteractions();
      });
    });
  
    onDestroy(() => {
      map?.remove();
    });
  </script>
  
  <div class="h-full w-full">
    <div bind:this={mapContainer} class="h-full w-full"></div>
  </div>
  
  <style>
    @import 'mapbox-gl/dist/mapbox-gl.css';
    
    :global(.mapboxgl-map) {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
    }
  </style>