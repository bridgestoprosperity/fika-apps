<script>
	import { onMount, onDestroy } from 'svelte';
	import { XmarkSolid } from 'svelte-awesome-icons';
	import { impactMapState } from '$lib/utils/state.svelte';
	import { 
		// createAccessTimeRadarConfig, // COMMENTED OUT FOR NOW
		formatChartValue
	} from '$lib/utils/chartUtils.js';
	
	// let chartCanvasRadar; // COMMENTED OUT FOR NOW
	// let radarChart; // COMMENTED OUT FOR NOW
	
	// Import Chart.js dynamically
	// let Chart; // COMMENTED OUT FOR NOW
	
	onMount(async () => {
		// CHART CODE COMMENTED OUT FOR NOW
		// // Dynamic import to avoid SSR issues
		// const chartModule = await import('chart.js/auto');
		// Chart = chartModule.default;
		// 
		// // Initialize charts if we have data
		// if (impactMapState.selectedHexData) {
		// 	initializeCharts();
		// }
	});
	
	// CHART CODE COMMENTED OUT FOR NOW
	// // Reactive statement to update charts when data changes
	// $: if (Chart && impactMapState.selectedHexData) {
	// 	// Add a small delay to ensure DOM is ready
	// 	setTimeout(() => {
	// 		initializeCharts();
	// 	}, 100);
	// }
	
	// CHART CODE COMMENTED OUT FOR NOW
	// function initializeCharts() {
	// 	if (!Chart || !impactMapState.selectedHexData) {
	// 		console.log('Charts not initialized - missing Chart or data');
	// 		return;
	// 	}
	// 	
	// 	const data = impactMapState.selectedHexData;
	// 	console.log('=== DATABASE DATA FOR CHARTS ===');
	// 	console.log('Full data object:', data);
	// 	console.log('Available fields:', Object.keys(data));
	// 	
	// 	// Check specific fields needed for radar chart
	// 	console.log('=== RADAR CHART FIELDS ===');
	// 	console.log('travel_time_no_sites_all_education:', data.travel_time_no_sites_all_education);
	// 	console.log('travel_time_all_education:', data.travel_time_all_education);
	// 	console.log('travel_time_no_sites_all_health:', data.travel_time_no_sites_all_health);
	// 	console.log('travel_time_all_health:', data.travel_time_all_health);
	// 	console.log('travel_time_no_sites_major_roads:', data.travel_time_no_sites_major_roads);
	// 	console.log('travel_time_major_roads:', data.travel_time_major_roads);
	// 	
	// 	try {
	// 		// Destroy existing chart
	// 		if (radarChart) radarChart.destroy();
	// 		
	// 		// Create radar chart for access times
	// 		if (chartCanvasRadar) {
	// 			console.log('Creating radar chart...');
	// 			const radarConfig = createAccessTimeRadarConfig(data);
	// 			console.log('=== RADAR CONFIG GENERATED ===');
	// 			console.log('Radar config:', radarConfig);
	// 			console.log('Chart data:', radarConfig.data);
	// 			console.log('Chart datasets:', radarConfig.data.datasets);
	// 			radarChart = new Chart(chartCanvasRadar, radarConfig);
	// 			setTimeout(() => radarChart.resize(), 50);
	// 		}
	// 		console.log('Chart initialized successfully');
	// 	} catch (error) {
	// 		console.error('Error initializing chart:', error);
	// 	}
	// }
	
	function hasInfrastructureUsage(data) {
		const healthBridges = data?.bridges_used_for_health_centers_optimal?.length || 0;
		const eduBridges = data?.bridges_used_for_all_education_facilities_fixed?.length || 0;
		const marketBridges = data?.bridges_used_for_major_roads_optimal?.length || 0;
		
		return healthBridges > 0 || eduBridges > 0 || marketBridges > 0;
	}
	
	function closePanel() {
		impactMapState.hexDataPanelOpen = false;
		impactMapState.selectedHexData = null;
	}
	
	onDestroy(() => {
		// CHART CODE COMMENTED OUT FOR NOW
		// if (radarChart) radarChart.destroy();
	});
</script>

<div class="panel-container" class:closed={!impactMapState.hexDataPanelOpen}>
	<div class="panel-card" class:closed={!impactMapState.hexDataPanelOpen}>
		<div class="header">
			<div class="content-area">
				<h2 class="panel-title">Hex Area Analysis</h2>
				{#if impactMapState.selectedHexData?.clickCoordinates}
					<p class="panel-subtitle">
						Location: {impactMapState.selectedHexData.clickCoordinates.lat.toFixed(4)}, {impactMapState.selectedHexData.clickCoordinates.lng.toFixed(4)}
					</p>
				{:else if impactMapState.selectedHexData}
					<p class="panel-subtitle">
						H3 Index: {impactMapState.selectedHexData.h3_index?.slice(0, 10)}...
					</p>
				{/if}
			</div>
			<button onclick={closePanel} class="close-button" aria-label="Close Panel">
				<XmarkSolid />
			</button>
		</div>
		
		<div class="panel-content">
			{#if impactMapState.selectedHexData}
				<!-- Access Times Radar Chart - COMMENTED OUT FOR NOW -->
				<!-- <div class="chart-section">
					<h3 class="section-title">Travel Time Impact Analysis</h3>
					<div class="chart-container">
						<canvas bind:this={chartCanvasRadar}></canvas>
					</div>
				</div> -->
				
				<!-- Walking Time Stats -->
				<div class="stats-section">
					<h3 class="section-title">Walking Time Stats</h3>
					<div class="stats-grid">
						<div class="stat-item">
							<span class="stat-label">Time to school without bridges:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.travel_time_no_sites_all_education, 'time')}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Time to school with bridges:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.travel_time_all_education, 'time')}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Time to healthcare without bridges:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.travel_time_no_sites_all_health, 'time')}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Time to healthcare with bridges:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.travel_time_all_health, 'time')}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Time to market without bridges:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.travel_time_no_sites_major_roads, 'time')}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Time to market with bridges:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.travel_time_major_roads, 'time')}</span>
						</div>
					</div>
				</div>
				
				<!-- Demographics Stats -->
				<div class="stats-section">
					<h3 class="section-title">Demographics</h3>
					<div class="stats-grid">
						<div class="stat-item">
							<span class="stat-label">RWI Score:</span>
							<span class="stat-value">{impactMapState.selectedHexData.rwi?.toFixed(3) || 'N/A'}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Population:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.population)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Births/Year:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.births)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Pregnancies/Year:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.pregnancies)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Female Education (years):</span>
							<span class="stat-value">{impactMapState.selectedHexData.female_educational_attainment_mean?.toFixed(1) || 'N/A'}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Male Education (years):</span>
							<span class="stat-value">{impactMapState.selectedHexData.male_educational_attainment_mean?.toFixed(1) || 'N/A'}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Underweight:</span>
							<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.underweight)}</span>
						</div>
					</div>
				</div>
				
				<!-- Infrastructure Usage Stats - COMMENTED OUT FOR NOW -->
				<!-- {#if hasInfrastructureUsage(impactMapState.selectedHexData)}
					<div class="stats-section">
						<h3 class="section-title">Infrastructure Usage</h3>
						<div class="stats-grid">
							<div class="stat-item">
								<span class="stat-label">Health Bridges:</span>
								<span class="stat-value">{impactMapState.selectedHexData.bridges_used_for_health_centers_optimal?.length || 0}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Education Bridges:</span>
								<span class="stat-value">{impactMapState.selectedHexData.bridges_used_for_all_education_facilities_fixed?.length || 0}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Market Bridges:</span>
								<span class="stat-value">{impactMapState.selectedHexData.bridges_used_for_major_roads_optimal?.length || 0}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Health Destinations:</span>
								<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.health_destinations)}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Education Destinations:</span>
								<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.edu_destinations)}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Market Destinations:</span>
								<span class="stat-value">{formatChartValue(impactMapState.selectedHexData.market_destinations)}</span>
							</div>
						</div>
					</div>
				{/if} -->
			{:else}
				<div class="empty-state">
					<p>Click on a hex to view detailed analysis</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.panel-container {
		position: absolute;
		top: 0;
		right: 0;
		height: 100vh;
		z-index: 1000;
		transition: transform 0.3s ease-in-out;
		transform: translateX(0);
		pointer-events: none;
	}
	
	.panel-container:not(.closed) {
		pointer-events: auto;
	}

	.panel-card {
		width: 400px;
		height: 100vh;
		border-radius: 10px 0px 0px 10px;
		background-color: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(5px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-right: none;
		transition: transform 0.3s ease-in-out;
		transform: translateX(0);
		overflow-y: auto;
		padding: 16px;
		box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
	}

	.panel-container.closed {
		transform: translateX(420px);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		position: sticky;
		top: 0;
		background-color: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(5px);
		z-index: 10;
		padding: 8px 0;
		margin: -8px -16px 16px -16px;
		padding-left: 16px;
		padding-right: 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.content-area {
		flex: 1;
		padding-right: 40px;
	}

	.panel-title {
		font-size: 18px;
		font-weight: bold;
		color: #111827;
		margin: 0 0 4px 0;
		font-family: 'Kumbh Sans', sans-serif;
	}

	.panel-subtitle {
		font-size: 12px;
		color: #6B7280;
		margin: 0;
		font-family: 'Source Code Pro', monospace;
	}

	.close-button {
		position: absolute;
		top: 8px;
		right: 16px;
		padding: 8px;
		background: none;
		border: none;
		cursor: pointer;
		color: rgba(0, 0, 0, 0.8);
		transition: color 0.2s ease;
	}

	.close-button:hover {
		color: rgb(125, 125, 125);
	}

	.panel-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.chart-section {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.chart-container {
		position: relative;
		height: 250px;
		width: 100%;
	}

	.stats-section {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.section-title {
		font-size: 14px;
		font-weight: bold;
		color: #111827;
		margin: 0 0 12px 0;
		font-family: 'Kumbh Sans', sans-serif;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.stat-label {
		font-size: 11px;
		color: #6B7280;
		font-weight: 500;
	}

	.stat-value {
		font-size: 11px;
		color: #111827;
		font-weight: bold;
		font-family: 'Source Code Pro', monospace;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: #6B7280;
		font-style: italic;
	}

	/* Custom scrollbar styling */
	.panel-card::-webkit-scrollbar {
		width: 6px;
	}

	.panel-card::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.panel-card::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.panel-card::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.3);
	}
</style>