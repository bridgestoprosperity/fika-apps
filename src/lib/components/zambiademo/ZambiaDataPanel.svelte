<script>
	import { onMount, onDestroy } from 'svelte';
	import { XmarkSolid } from 'svelte-awesome-icons';
	import { zambiaMapState } from '$lib/utils/state.svelte.js';
	import { CHART_COLORS, CHART_FONTS } from '$lib/utils/chartUtils.js';

	let chartCanvas;
	let barChart;
	let Chart;
	let currentFeatureId = null;

	function countPgArray(str) {
		if (!str || typeof str !== 'string') return 0;
		const cleaned = str.replace(/[{}]/g, '').trim();
		if (!cleaned) return 0;
		return cleaned.split(',').length;
	}

	function formatMinutes(val) {
		if (val == null || val === 0) return 'N/A';
		const num = Number(val);
		if (isNaN(num)) return String(val);
		if (num < 60) return `${Math.round(num)} min`;
		const hours = Math.floor(num / 60);
		const mins = Math.round(num % 60);
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	function formatNumber(val, decimals = 0) {
		if (val == null) return 'N/A';
		const num = Number(val);
		if (isNaN(num)) return String(val);
		return num.toFixed(decimals);
	}

	let clickType = $derived(zambiaMapState.clickedFeatureType);

	let props = $derived.by(() => {
		if (clickType === 'hex') return zambiaMapState.selectedHexData?.properties;
		if (clickType === 'bridge') return zambiaMapState.selectedBridgeData?.properties;
		if (clickType === 'destination') return zambiaMapState.selectedDestinationData?.properties;
		return null;
	});

	// Hex-specific derived values
	let healthTimeSaved = $derived.by(() => {
		if (!props || clickType !== 'hex') return 0;
		return Math.round(Number(props.time_delta_no_sites_all_health) || 0);
	});

	let eduTimeSaved = $derived.by(() => {
		if (!props || clickType !== 'hex') return 0;
		return Math.round(Number(props.time_delta_no_sites_all_education) || 0);
	});

	let healthTimeWith = $derived.by(() => {
		if (!props || clickType !== 'hex') return 0;
		return Math.round(Number(props.travel_time_all_health) || 0);
	});

	let eduTimeWith = $derived.by(() => {
		if (!props || clickType !== 'hex') return 0;
		return Math.round(Number(props.travel_time_all_education) || 0);
	});

	let healthTimeWithout = $derived(healthTimeWith + healthTimeSaved);
	let eduTimeWithout = $derived(eduTimeWith + eduTimeSaved);
	let totalTimeSaved = $derived(healthTimeSaved + eduTimeSaved);

	let bridgeCount = $derived.by(() => {
		if (!props) return 0;
		const ids = new Set();
		Object.keys(props).forEach((key) => {
			if (key.startsWith('bridges_used_for_')) {
				const cleaned = String(props[key] || '').replace(/[{}]/g, '').trim();
				if (cleaned) cleaned.split(',').forEach((id) => ids.add(id.trim()));
			}
		});
		return ids.size;
	});

	let healthDestCount = $derived(props ? countPgArray(props.health_destinations) : 0);
	let eduDestCount = $derived(props ? countPgArray(props.edu_destinations) : 0);

	// Bridge-specific
	let bridgeHexCount = $derived.by(() => {
		if (!props || clickType !== 'bridge') return 0;
		const allHexes = new Set();
		Object.keys(props).forEach((key) => {
			if (key.startsWith('used_by_h3_for_')) {
				const cleaned = String(props[key] || '').replace(/[{}]/g, '').trim();
				if (cleaned) cleaned.split(',').forEach((h) => allHexes.add(h.trim()));
			}
		});
		return allHexes.size;
	});

	onMount(async () => {
		const chartModule = await import('chart.js/auto');
		Chart = chartModule.default;
		if (zambiaMapState.dataPanelOpen && clickType === 'hex' && props) {
			createChart();
		}
	});

	$effect(() => {
		if (!Chart || !zambiaMapState.dataPanelOpen || clickType !== 'hex' || !props || !chartCanvas) return;

		const featureId = props.h3_index || 'unknown';
		if (featureId !== currentFeatureId || !barChart) {
			currentFeatureId = featureId;
			createChart();
		}
	});

	$effect(() => {
		if (!zambiaMapState.dataPanelOpen && barChart) {
			barChart.destroy();
			barChart = null;
			currentFeatureId = null;
		}
	});

	function createChart() {
		if (!Chart || !chartCanvas) return;

		if (barChart) {
			barChart.destroy();
			barChart = null;
		}

		const config = {
			type: 'bar',
			data: {
				labels: ['Healthcare', 'Education'],
				datasets: [
					{
						label: 'With Bridges',
						data: [healthTimeWith, eduTimeWith],
						backgroundColor: 'rgba(0, 145, 73, 0.75)',
						borderColor: '#009149',
						borderWidth: 1,
						borderRadius: 4,
						barPercentage: 0.7,
						categoryPercentage: 0.6
					},
					{
						label: 'Without Bridges',
						data: [healthTimeWithout, eduTimeWithout],
						backgroundColor: 'rgba(206, 97, 96, 0.75)',
						borderColor: '#b43d2d',
						borderWidth: 1,
						borderRadius: 4,
						barPercentage: 0.7,
						categoryPercentage: 0.6
					}
				]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				layout: { padding: { top: 4, bottom: 4, left: 0, right: 8 } },
				scales: {
					x: {
						beginAtZero: true,
						title: { display: true, text: 'Minutes', font: { ...CHART_FONTS, size: 10 }, color: '#6b7280' },
						ticks: { font: { ...CHART_FONTS, size: 9 }, color: '#6b7280' },
						grid: { color: 'rgba(0,0,0,0.05)' }
					},
					y: {
						ticks: { font: { ...CHART_FONTS, size: 11, weight: 'bold' }, color: '#374151' },
						grid: { display: false }
					}
				},
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							usePointStyle: true,
							padding: 12,
							boxWidth: 10,
							boxHeight: 10,
							font: { ...CHART_FONTS, size: 10 }
						}
					},
					tooltip: {
						backgroundColor: 'rgba(255,255,255,0.95)',
						borderColor: '#e5e7eb',
						borderWidth: 1,
						titleColor: '#111827',
						bodyColor: '#374151',
						titleFont: { ...CHART_FONTS, weight: 'bold' },
						bodyFont: CHART_FONTS,
						callbacks: {
							label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} min`
						}
					}
				}
			}
		};

		barChart = new Chart(chartCanvas, config);

		setTimeout(() => {
			if (barChart) {
				barChart.resize();
				barChart.update('none');
			}
		}, 100);
	}

	function closePanel() {
		if (barChart) {
			barChart.destroy();
			barChart = null;
		}
		currentFeatureId = null;
		zambiaMapState.dataPanelOpen = false;
		zambiaMapState.filterMode = false;
		zambiaMapState.clickedFeatureType = null;
		zambiaMapState.selectedHexData = null;
		zambiaMapState.selectedBridgeData = null;
		zambiaMapState.selectedDestinationData = null;
		zambiaMapState.highlightedBridges = [];
		zambiaMapState.highlightedDestinations = [];
		zambiaMapState.highlightedHexes = [];
		zambiaMapState.pathsVisible = false;
	}

	onDestroy(() => {
		if (barChart) barChart.destroy();
	});
</script>

<div class="panel-container" class:closed={!zambiaMapState.dataPanelOpen}>
	<div class="panel-card">
		<!-- Header -->
		<div class="panel-header">
			<div>
				<h2 class="panel-title">
					{#if clickType === 'hex'}
						Community Area
					{:else if clickType === 'bridge'}
						Bridge Site
					{:else if clickType === 'destination'}
						{props?.name || 'Facility'}
					{/if}
				</h2>
				{#if clickType === 'destination' && props?.category}
					<p class="panel-subtitle">{props.category}</p>
				{:else if clickType === 'bridge' && props?.type}
					<p class="panel-subtitle">{props.type.replace(/_/g, ' ')}</p>
				{/if}
			</div>
			<button onclick={closePanel} class="close-btn" aria-label="Close">
				<XmarkSolid size="14" />
			</button>
		</div>

		{#if props}
			<div class="panel-body">
				<!-- ============ HEX CONTENT ============ -->
				{#if clickType === 'hex'}
					<!-- Bridge Impact Chart -->
					{#if totalTimeSaved > 0}
						<div class="section">
							<h3 class="section-title">Bridge Impact on Travel Time</h3>
							<div class="chart-wrap">
								<canvas bind:this={chartCanvas}></canvas>
							</div>
							<div class="savings-row">
								{#if healthTimeSaved > 0}
									<div class="saving-chip health">
										<span class="saving-value">{healthTimeSaved} min</span>
										<span class="saving-label">saved to health</span>
									</div>
								{/if}
								{#if eduTimeSaved > 0}
									<div class="saving-chip edu">
										<span class="saving-value">{eduTimeSaved} min</span>
										<span class="saving-label">saved to school</span>
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<div class="section">
							<h3 class="section-title">Bridge Impact on Travel Time</h3>
							<p class="muted-text">No measurable bridge impact for this area. Bridges may not be on the optimal route to the nearest facilities.</p>
							<!-- Still render chart canvas for reactivity -->
							<div style="display:none"><canvas bind:this={chartCanvas}></canvas></div>
						</div>
					{/if}

					<!-- Community Snapshot -->
					<div class="section">
						<h3 class="section-title">Community Snapshot</h3>
						<div class="stat-grid">
							<div class="stat-card">
								<span class="stat-value">{formatNumber(props.population)}</span>
								<span class="stat-label">Population</span>
							</div>
							<div class="stat-card">
								<span class="stat-value">{formatNumber(props.rwi, 2)}</span>
								<span class="stat-label">Wealth Index</span>
							</div>
							<div class="stat-card">
								<span class="stat-value">{formatNumber(props.female_educational_attainment_mean, 1)} yrs</span>
								<span class="stat-label">Female Education</span>
							</div>
							<div class="stat-card">
								<span class="stat-value">{formatNumber(Number(props.underweight) * 100, 0)}%</span>
								<span class="stat-label">Underweight</span>
							</div>
						</div>
					</div>

					<!-- Narrative -->
					<div class="section narrative">
						{#if totalTimeSaved > 0}
							<p>
								This community of <strong>{formatNumber(props.population)} people</strong> saves
								a total of <strong>{totalTimeSaved} minutes</strong> of walking time thanks to
								<strong>{bridgeCount} bridge{bridgeCount !== 1 ? 's' : ''}</strong> in the area.
							</p>
							{#if healthTimeSaved > 0}
								<p>
									Healthcare access improves by <strong>{healthTimeSaved} minutes</strong> — from {formatMinutes(healthTimeWithout)} down to {formatMinutes(healthTimeWith)}.
								</p>
							{/if}
							{#if eduTimeSaved > 0}
								<p>
									School access improves by <strong>{eduTimeSaved} minutes</strong> — from {formatMinutes(eduTimeWithout)} down to {formatMinutes(eduTimeWith)}.
								</p>
							{/if}
						{:else}
							<p>
								This community of <strong>{formatNumber(props.population)} people</strong> has
								access to <strong>{healthDestCount} health</strong> and <strong>{eduDestCount} education</strong> facilities.
							</p>
						{/if}
					</div>

					<!-- Connectivity -->
					<div class="section">
						<h3 class="section-title">Connectivity</h3>
						<div class="connectivity-grid">
							<div class="conn-item">
								<span class="conn-value">{bridgeCount}</span>
								<span class="conn-label">Bridges Used</span>
							</div>
							<div class="conn-item">
								<span class="conn-value">{healthDestCount}</span>
								<span class="conn-label">Health Facilities</span>
							</div>
							<div class="conn-item">
								<span class="conn-value">{eduDestCount}</span>
								<span class="conn-label">Schools</span>
							</div>
							<div class="conn-item">
								<span class="conn-value">{formatMinutes(props.travel_time_all_health)}</span>
								<span class="conn-label">To Healthcare</span>
							</div>
							<div class="conn-item">
								<span class="conn-value">{formatMinutes(props.travel_time_all_education)}</span>
								<span class="conn-label">To School</span>
							</div>
							<div class="conn-item">
								<span class="conn-value">{formatMinutes(props.travel_time_major_roads)}</span>
								<span class="conn-label">To Major Road</span>
							</div>
						</div>
					</div>

				<!-- ============ BRIDGE CONTENT ============ -->
				{:else if clickType === 'bridge'}
					<div class="section">
						<h3 class="section-title">Bridge Details</h3>
						<div class="detail-list">
							<div class="detail-row">
								<span class="detail-label">Bridge Index</span>
								<span class="detail-value">{props.bridge_index}</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">Communities Served</span>
								<span class="detail-value">{bridgeHexCount}</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">Health Facilities Connected</span>
								<span class="detail-value">{countPgArray(props.health_destinations)}</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">Schools Connected</span>
								<span class="detail-value">{countPgArray(props.edu_destinations)}</span>
							</div>
						</div>
					</div>

					<div class="section narrative">
						<p>
							This bridge connects <strong>{bridgeHexCount} communities</strong> to
							<strong>{countPgArray(props.health_destinations)} health facilities</strong> and
							<strong>{countPgArray(props.edu_destinations)} schools</strong>, reducing travel
							time for residents who would otherwise need to find alternative routes.
						</p>
					</div>

				<!-- ============ DESTINATION CONTENT ============ -->
				{:else if clickType === 'destination'}
					<div class="section">
						<h3 class="section-title">Facility Details</h3>
						<div class="detail-list">
							{#if props.facility_type}
								<div class="detail-row">
									<span class="detail-label">Type</span>
									<span class="detail-value">{props.facility_type === 'school' ? 'Education' : 'Healthcare'}</span>
								</div>
							{/if}
							{#if props.category}
								<div class="detail-row">
									<span class="detail-label">Category</span>
									<span class="detail-value">{props.category}</span>
								</div>
							{/if}
							<div class="detail-row">
								<span class="detail-label">Communities Served</span>
								<span class="detail-value">{countPgArray(props.h3_indices)}</span>
							</div>
							<div class="detail-row">
								<span class="detail-label">Bridges Used</span>
								<span class="detail-value">{countPgArray(props.bridges_used)}</span>
							</div>
						</div>
					</div>

					<div class="section narrative">
						<p>
							<strong>{props.name || 'This facility'}</strong> serves
							<strong>{countPgArray(props.h3_indices)} communities</strong>.
							{#if countPgArray(props.bridges_used) > 0}
								Access relies on <strong>{countPgArray(props.bridges_used)} bridge{countPgArray(props.bridges_used) !== 1 ? 's' : ''}</strong> to
								reduce walking distances for the populations it serves.
							{/if}
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.panel-container {
		position: absolute;
		top: 0;
		right: 0;
		height: 100vh;
		z-index: 50;
		transition: transform 0.3s ease-in-out;
		transform: translateX(0);
		pointer-events: none;
	}

	.panel-container:not(.closed) {
		pointer-events: auto;
	}

	.panel-container.closed {
		transform: translateX(380px);
	}

	.panel-card {
		width: 350px;
		height: 100vh;
		border-radius: 10px 0 0 10px;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-right: none;
		overflow-y: auto;
		box-shadow: -4px 0 20px rgba(0, 0, 0, 0.12);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 16px 16px 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		position: sticky;
		top: 0;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(8px);
		z-index: 10;
	}

	.panel-title {
		font-size: 16px;
		font-weight: 700;
		color: #111827;
		margin: 0;
		font-family: 'Kumbh Sans', sans-serif;
	}

	.panel-subtitle {
		font-size: 11px;
		color: #6b7280;
		margin: 2px 0 0;
		text-transform: capitalize;
	}

	.close-btn {
		padding: 6px;
		background: none;
		border: none;
		cursor: pointer;
		color: #9ca3af;
		transition: color 0.2s;
		border-radius: 4px;
	}

	.close-btn:hover {
		color: #374151;
		background: rgba(0, 0, 0, 0.04);
	}

	.panel-body {
		padding: 12px 16px 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.section {
		background: rgba(0, 0, 0, 0.02);
		border-radius: 8px;
		padding: 12px;
		border: 1px solid rgba(0, 0, 0, 0.04);
	}

	.section-title {
		font-size: 12px;
		font-weight: 700;
		color: #374151;
		margin: 0 0 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-family: 'Kumbh Sans', sans-serif;
	}

	.chart-wrap {
		position: relative;
		height: 140px;
		width: 100%;
	}

	.savings-row {
		display: flex;
		gap: 8px;
		margin-top: 8px;
	}

	.saving-chip {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 6px 8px;
		border-radius: 6px;
		text-align: center;
	}

	.saving-chip.health {
		background: rgba(180, 61, 45, 0.08);
		border: 1px solid rgba(180, 61, 45, 0.15);
	}

	.saving-chip.edu {
		background: rgba(200, 133, 52, 0.08);
		border: 1px solid rgba(200, 133, 52, 0.15);
	}

	.saving-value {
		font-size: 16px;
		font-weight: 700;
		color: #009149;
		font-family: 'Source Code Pro', monospace;
	}

	.saving-label {
		font-size: 10px;
		color: #6b7280;
		margin-top: 2px;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px 8px;
		background: white;
		border-radius: 6px;
		border: 1px solid rgba(0, 0, 0, 0.06);
	}

	.stat-value {
		font-size: 18px;
		font-weight: 700;
		color: #111827;
		font-family: 'Source Code Pro', monospace;
	}

	.stat-label {
		font-size: 10px;
		color: #6b7280;
		margin-top: 2px;
		text-align: center;
	}

	.narrative {
		background: rgba(0, 145, 73, 0.04);
		border-color: rgba(0, 145, 73, 0.1);
	}

	.narrative p {
		font-size: 13px;
		color: #374151;
		line-height: 1.5;
		margin: 0 0 6px;
	}

	.narrative p:last-child {
		margin-bottom: 0;
	}

	.connectivity-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 6px;
	}

	.conn-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px 4px;
		background: white;
		border-radius: 6px;
		border: 1px solid rgba(0, 0, 0, 0.06);
	}

	.conn-value {
		font-size: 14px;
		font-weight: 700;
		color: #161345;
		font-family: 'Source Code Pro', monospace;
	}

	.conn-label {
		font-size: 9px;
		color: #6b7280;
		margin-top: 2px;
		text-align: center;
	}

	.detail-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.04);
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.detail-label {
		font-size: 12px;
		color: #6b7280;
	}

	.detail-value {
		font-size: 12px;
		font-weight: 600;
		color: #111827;
		font-family: 'Source Code Pro', monospace;
	}

	.muted-text {
		font-size: 12px;
		color: #9ca3af;
		font-style: italic;
		margin: 0;
	}

	/* Scrollbar */
	.panel-card::-webkit-scrollbar {
		width: 4px;
	}

	.panel-card::-webkit-scrollbar-track {
		background: transparent;
	}

	.panel-card::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.15);
		border-radius: 2px;
	}
</style>
