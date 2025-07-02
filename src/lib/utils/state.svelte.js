const generalState = $state({
	controlPanelOpen: true
});

const waternetMapState = $state({
	visibility: {
		vectorData: false,
		rasterData: true,
		satelliteImagery: false
	},
	style: {
		selectedPalette: 'inferno',
		satStyle: 'Color',
		vectorStyle: 'Stream Order',
		streamOrderThreshold: 12,
		streamOrderValue: ''
	}
});

const saiMapState = $state({
	selectedViz: 'travel_time_health_centers',
	selectedPalette: 'inferno',
	reversePalette: true,
	satelliteImagery: false,
	clickedData: {}
});

const hexMapState = $state({
	selectedViz: 'population',
	selectedPalette: 'magma',
	reversePalette: true,
	satelliteImagery: false,
	clickedData: {}
});

const impactMapDatabaseState = $state({
	selectedLayer: 'bridges',
	selectedPalette: 'viridis',
	satelliteImagery: false,
	highlightedFeature: null,
	filterByYear: false,
	yearRange: [2010, 2024],
	loadingData: false,
	error: null,
	enableClustering: false,
	dataCount: 0,
	showHexLayer: true,
	hexDataViz: 'population',
	hexReversePalette: true
});

const impactMapState = $state({
	menuState: 'Relative Wealth Index',
	dataName: 'rwi',
	satelliteImagery: false,
	clickedData: {},
	dataMapKey: 'Relative Wealth Index', // Key to the selected data in impactDataMap
	selectedHexData: null, // Currently selected hex data from API
	filterMode: false, // Whether infrastructure filtering is active
	highlightedBridges: [], // Array of bridge IDs to highlight
	highlightedHealthFacilities: [], // Array of health facility IDs to highlight
	highlightedEducationFacilities: [] // Array of education facility IDs to highlight
});

export {
	generalState,
	waternetMapState,
	saiMapState,
	hexMapState,
	impactMapDatabaseState,
	impactMapState
};
