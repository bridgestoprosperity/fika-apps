<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import 'maplibre-gl/dist/maplibre-gl.css';

  let mapContainer;
  let map;

  onMount(async () => {
    if (!browser) return;

    const maplibregl = (await import('maplibre-gl')).default;
    const { Protocol } = await import('pmtiles');

    // Initialize the PMTiles protocol
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    map = new maplibregl.Map({
      container: mapContainer,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [-74.5, 40],
      zoom: 3
    });

    map.on('load', () => {
      map.addSource('waterways', {
        type: 'vector',
        url: 'pmtiles://https://data.source.coop/fika/waternet/pmtiles/waterway_model_outputs_20m_vector.pmtiles'
      });

      map.addLayer({
        'id': 'waterway-lines',
        'type': 'line',
        'source': 'waterways',
        'source-layer': 'waterways',
        'paint': {
          'line-color': '#0066FF',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });
    });

    return () => {
      map?.remove();
    };
  });
</script>

<div bind:this={mapContainer} class="map-container" />

<style>
  .map-container {
    width: 100%;
    height: 400px;
  }
</style>