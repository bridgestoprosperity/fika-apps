const generalState = $state({
    controlPanelOpen: true,
});

const waternetMapState = $state({
    visibility: {
        vectorData: false,
        rasterData: true,
        satelliteImagery: false,
    },
    style: {
        selectedPalette: 'inferno',
        satStyle: 'Color',
        vectorStyle: 'Stream Order',
        streamOrderThreshold: 12,
        streamOrderValue: '',
    }
});

const saiMapState = $state({
    selectedViz: 'travel_time',
    selectedPalette: 'inferno',
    reversePalette: true,
    satelliteImagery: false,
    clickedData: {},
});

const impactMapState = $state({
    selectedLayer: 'bridges',
    selectedPalette: 'viridis',
    satelliteImagery: false,
    highlightedFeature: null,
    filterByYear: false,
    yearRange: [2010, 2024],
    loadingData: false,
    error: null,
    enableClustering: false,
    dataCount: 0
});

export { generalState, waternetMapState, saiMapState, impactMapState };