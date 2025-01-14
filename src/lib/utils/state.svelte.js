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

export { generalState, waternetMapState, saiMapState };