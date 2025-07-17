<script>
	import { onMount, onDestroy } from 'svelte';
	import { XmarkSolid } from 'svelte-awesome-icons';
	import { impactMapState } from '$lib/utils/state.svelte';
	import {
		createAccessTimeRadarConfig, 
		formatChartValue,
		calculatePercentile
	} from '$lib/utils/chartUtils.js';
	import { impactDataMap } from '$lib/utils/impactmap/impactDataMap.js';
	import PercentileBars from '$lib/components/charts/PercentileBars.svelte';

	let chartCanvasRadar; 
	let radarChart; 

	let Chart; 

	onMount(async () => {
		// Dynamic import to avoid SSR issues
		const chartModule = await import('chart.js/auto');
		Chart = chartModule.default;
		
		// Initialize charts if we have data
		if (impactMapState.selectedHexData) {
			initializeCharts();
		}
	});

	// Track the current hex ID to detect changes
	let currentHexId = null;

	// Use $effect for reliable reactivity to state changes
	$effect(() => {
		const hexData = impactMapState.selectedHexData;
		const hexId = hexData?.h3_index || (hexData?.clickCoordinates ? 
			`${hexData.clickCoordinates.lat.toFixed(6)},${hexData.clickCoordinates.lng.toFixed(6)}` : null);
		
		console.log('🔍 Effect triggered:', {
			hasChart: !!Chart,
			hasHexData: !!hexData,
			hasCanvas: !!chartCanvasRadar,
			currentHexId,
			newHexId: hexId,
			different: hexId !== currentHexId,
			panelOpen: impactMapState.hexDataPanelOpen
		});
		
		// Only proceed if panel is open, we have all requirements, and it's a different hex
		if (Chart && hexData && chartCanvasRadar && impactMapState.hexDataPanelOpen) {
			if (hexId !== currentHexId || !radarChart) {
				console.log('🔄 Updating chart - hex changed from', currentHexId, 'to', hexId, 'or chart missing:', !radarChart);
				currentHexId = hexId;
				// Force immediate chart update
				initializeCharts();
			} else {
				console.log('⏺️ Same hex and chart exists, skipping update');
			}
		}
	});

	// Clean up chart when panel closes
	$effect(() => {
		if (!impactMapState.hexDataPanelOpen && radarChart) {
			console.log('Panel closed, cleaning up chart');
			radarChart.destroy();
			radarChart = null;
			currentHexId = null; // Reset tracking
		}
	});


	function initializeCharts() {
		if (!Chart || !impactMapState.selectedHexData || !chartCanvasRadar) {
			console.log('Charts not initialized - missing requirements:', {
				Chart: !!Chart,
				selectedHexData: !!impactMapState.selectedHexData,
				chartCanvasRadar: !!chartCanvasRadar
			});
			return;
		}
	
		const data = impactMapState.selectedHexData;
		const dataId = data.h3_index || (data.clickCoordinates ? 
			`${data.clickCoordinates.lat.toFixed(6)},${data.clickCoordinates.lng.toFixed(6)}` : 'unknown');
		
		console.log('=== INITIALIZING RADAR CHART ===');
		console.log('Data ID/coords:', dataId);
		console.log('Current radar chart exists:', !!radarChart);
	
		try {
			// Always destroy existing chart first
			if (radarChart) {
				console.log('Destroying existing chart');
				radarChart.destroy();
				radarChart = null;
			}
	
			// Create new radar chart
			console.log('Creating new radar chart for data:', dataId);
			const radarConfig = createAccessTimeRadarConfig(data);
			
			radarChart = new Chart(chartCanvasRadar, radarConfig);
			console.log('✅ Radar chart created successfully for:', dataId);
			
			// Force resize and update after creation
			setTimeout(() => {
				if (radarChart) {
					radarChart.resize();
					radarChart.update('none'); // Update without animation
					console.log('Chart resized and updated for:', dataId);
				}
			}, 100); // Increased delay slightly
			
		} catch (error) {
			console.error('❌ Error creating radar chart:', error);
			console.error('Error stack:', error.stack);
		}
	}

	function hasInfrastructureUsage(data) {
		const healthBridges = data?.bridges_used_for_health_centers_optimal?.length || 0;
		const eduBridges = data?.bridges_used_for_all_education_facilities_fixed?.length || 0;
		const marketBridges = data?.bridges_used_for_major_roads_optimal?.length || 0;

		return healthBridges > 0 || eduBridges > 0 || marketBridges > 0;
	}

	function closePanel() {
		// Clean up chart before closing
		if (radarChart) {
			radarChart.destroy();
			radarChart = null;
		}
		currentHexId = null; // Reset tracking
		impactMapState.hexDataPanelOpen = false;
		impactMapState.selectedHexData = null;
	}

	onDestroy(() => {
		if (radarChart) radarChart.destroy();
	});
</script>

<div class="panel-container" class:closed={!impactMapState.hexDataPanelOpen}>
	<div class="panel-card" class:closed={!impactMapState.hexDataPanelOpen}>
		<div class="header">
			<div class="content-area">
				<h2 class="panel-title">Hex Area Analysis</h2>
				{#if impactMapState.selectedHexData?.clickCoordinates}
					<p class="panel-subtitle">
						Location: {impactMapState.selectedHexData.clickCoordinates.lat.toFixed(4)}, {impactMapState.selectedHexData.clickCoordinates.lng.toFixed(
							4
						)}
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
				<div class="chart-section">
					<h3 class="section-title">Travel Time Impact Analysis</h3>
					<div class="chart-container">
						<canvas bind:this={chartCanvasRadar}></canvas>
					</div>
				</div>

				<!-- Walking Time Stats -->
				<div class="stats-section">
					<h3 class="section-title">Walking Time Stats</h3>
					<div class="percentile-grid">
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.travel_time_no_sites_all_education,
								'travel_time_no_sites_all_education',
								impactDataMap
							)}
							reverse={impactDataMap.travel_time_no_sites_all_education?.meta_info?.reverse_color_scale || false}
							label="Time to school without bridges">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.travel_time_no_sites_all_education,
									'time'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.travel_time_all_education,
								'travel_time_all_education',
								impactDataMap
							)}
							reverse={impactDataMap.travel_time_all_education?.meta_info?.reverse_color_scale || false}
							label="Time to school with bridges">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.travel_time_all_education,
									'time'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.travel_time_no_sites_all_health,
								'travel_time_no_sites_all_health',
								impactDataMap
							)}
							reverse={impactDataMap.travel_time_no_sites_all_health?.meta_info?.reverse_color_scale || false}
							label="Time to healthcare w/o bridges">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.travel_time_no_sites_all_health,
									'time'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.travel_time_all_health,
								'travel_time_all_health',
								impactDataMap
							)}
							reverse={impactDataMap.travel_time_all_health?.meta_info?.reverse_color_scale || false}
							label="Time to healthcare with bridges">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.travel_time_all_health,
									'time'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.travel_time_no_sites_major_roads,
								'travel_time_no_sites_major_roads',
								impactDataMap
							)}
							reverse={impactDataMap.travel_time_no_sites_major_roads?.meta_info?.reverse_color_scale || false}
							label="to market without bridges">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.travel_time_no_sites_major_roads,
									'time'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.travel_time_major_roads,
								'travel_time_major_roads',
								impactDataMap
							)}
							reverse={impactDataMap.travel_time_major_roads?.meta_info?.reverse_color_scale || false}
							label="to market with bridges">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.travel_time_major_roads,
									'time'
								)}</span>
							{/snippet}
						</PercentileBars>
					</div>
				</div>

				<!-- Demographics Stats -->
				<div class="stats-section">
					<h3 class="section-title">Demographics</h3>
					<div class="percentile-grid">
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.rwi,
								'rwi',
								impactDataMap
							)}
							reverse={impactDataMap.rwi?.meta_info?.reverse_color_scale || false}
							label="Relative Wealth Index">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.rwi,
									impactDataMap.rwi?.meta_info?.unit || ''
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.population,
								'population',
								impactDataMap
							)}
							reverse={impactDataMap.population?.meta_info?.reverse_color_scale || false}
							label="Population"
							neutral={true}>
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.population,
									impactDataMap.population?.meta_info?.unit || 'people'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.births,
								'births',
								impactDataMap
							)}
							reverse={impactDataMap.births?.meta_info?.reverse_color_scale || false}
							label="Births per Year"
							neutral={true}>
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.births,
									impactDataMap.births?.meta_info?.unit || '/yr'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.pregnancies,
								'pregnancies',
								impactDataMap
							)}
							reverse={impactDataMap.pregnancies?.meta_info?.reverse_color_scale || false}
							label="Pregnancies per Year"
							neutral={true}>
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.pregnancies,
									impactDataMap.pregnancies?.meta_info?.unit || '/yr'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.female_educational_attainment_mean,
								'female_educational_attainment_mean',
								impactDataMap
							)}
							reverse={impactDataMap.female_educational_attainment_mean?.meta_info?.reverse_color_scale || false}
							label="Female Education">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.female_educational_attainment_mean,
									impactDataMap.female_educational_attainment_mean?.meta_info?.unit || 'years'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.male_educational_attainment_mean,
								'male_educational_attainment_mean',
								impactDataMap
							)}
							reverse={impactDataMap.male_educational_attainment_mean?.meta_info?.reverse_color_scale || false}
							label="Male Education">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.male_educational_attainment_mean,
									impactDataMap.male_educational_attainment_mean?.meta_info?.unit || 'years'
								)}</span>
							{/snippet}
						</PercentileBars>
						
						<PercentileBars
							activatedBars={calculatePercentile(
								impactMapState.selectedHexData.underweight,
								'underweight',
								impactDataMap
							)}
							reverse={impactDataMap.underweight?.meta_info?.reverse_color_scale || false}
							label="Underweight Percentage">
							{#snippet numbers()}
								<span>{formatChartValue(
									impactMapState.selectedHexData.underweight,
									impactDataMap.underweight?.meta_info?.unit || 'percentile'
								)}</span>
							{/snippet}
						</PercentileBars>
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
		color: #6b7280;
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
		gap: 12px;
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
		padding: 10px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.section-title {
		font-size: 14px;
		font-weight: bold;
		color: #111827;
		margin: 0 0 8px 0;
		font-family: 'Kumbh Sans', sans-serif;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.percentile-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
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
		color: #6b7280;
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
		color: #6b7280;
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
