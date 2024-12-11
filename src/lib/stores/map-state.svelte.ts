interface MapState {
    streamOrder: number;
    vectorData: boolean;
    rasterData: boolean;
    satelliteImagery: boolean;
    selectedPalette: string;
    satStyle: 'Color' | 'Black and White';
    vectorStyle: 'Stream Order' | 'TDX Hydro Comparison';
  }
  
  export const mapState = $state<MapState>({
    streamOrder: 0,
    vectorData: true,
    rasterData: true,
    selectedPalette: 'inferno',
    satelliteImagery: false,
    satStyle: 'Color',
    vectorStyle: 'Stream Order'
  });
  
  export function getLayerVisibility(layer: 'vector' | 'raster' | 'satellite') {
    const visibilityMap = {
      vector: () => mapState.vectorData ? 'visible' : 'none',
      raster: () => mapState.rasterData ? 'visible' : 'none',
      satellite: () => mapState.satelliteImagery ? 'visible' : 'none'
    };
    return visibilityMap[layer]();
  }