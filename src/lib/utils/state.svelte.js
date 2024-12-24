export let waternetMapState = $state({
    visibility: {
        controlPanelOpen: true,
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
})