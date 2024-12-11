import type { LayerSpecification } from 'mapbox-gl';
import { mapState, getLayerVisibility } from '$lib/stores/map-state.svelte';
import { palettes } from '$lib/colorPalettes';

const VIOLET_OCEAN = [
  '#93ECDD', '#7DD6E0', '#6DC0DE', '#66A9DA', '#5493D9',
  '#507CD4', '#5E60C7', '#6043C0', '#6A11B1', '#9F237E'
];

function getVectorPaint() {
  return {
    'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.1, 12, 2],
    'line-color': mapState.vectorStyle === 'Stream Order'
      ? [
          'match',
          ['get', 'stream_order'],
          ...VIOLET_OCEAN.flatMap((color, i) => [i, color]),
          VIOLET_OCEAN[VIOLET_OCEAN.length - 1]
        ]
      : ['case', ['==', ['get', 'from_tdx'], true], '#0C7BDC', '#FFCE00']
  };
}

function getRasterPaint() {
  if (!mapState.rasterData) return {};
  return {
    'raster-color': [
      'interpolate',
      ['linear'],
      ['raster-value'],
      38, palettes[mapState.selectedPalette][0],
      64, palettes[mapState.selectedPalette][1],
      128, palettes[mapState.selectedPalette][2],
      192, palettes[mapState.selectedPalette][3],
      217, palettes[mapState.selectedPalette][4]
    ],
    'raster-color-mix': [256, 0, 0, 0],
    'raster-color-range': [0, 256]
  };
}

export function createVectorLayer(): LayerSpecification {
  return {
    id: 'vector-waternet',
    source: 'waterways',
    'source-layer': 'waterways',
    type: 'line',
    filter: [
      'all',
      ['!=', ['get', 'intersects_lake'], true],
      ['any', ['==', ['get', 'stream_order'], 1], ['>=', ['zoom'], 4]]
    ],
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
      visibility: getLayerVisibility('vector')
    },
    paint: getVectorPaint()
  };
}

export function createRasterLayer(): LayerSpecification {
  return {
    id: 'raster-waternet',
    type: 'raster',
    source: {
      type: 'raster',
      tiles: ['https://public-b2p-geodata.s3.amazonaws.com/waternet-raster-tiles/{z}/{x}/{y}.png'],
      tileSize: 256
    },
    layout: {
      visibility: getLayerVisibility('raster')
    },
    paint: getRasterPaint()
  };
}

export function createSatelliteLayer(): LayerSpecification {
  return {
    id: 'satellite-layer',
    type: 'raster',
    source: {
      type: 'raster',
      url: 'mapbox://mapbox.satellite',
      tileSize: 256
    },
    layout: {
      visibility: getLayerVisibility('satellite')
    },
    paint: {
      'raster-saturation': mapState.satStyle === 'Black and White' ? -1 : 0
    }
  };
}