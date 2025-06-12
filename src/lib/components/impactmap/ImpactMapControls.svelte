<script>
	import { impactMapState } from '$lib/utils/state.svelte.js';
	import { impactMenus } from '$lib/utils/impactmap/impactMenus.js';
	import { impactDataMap } from '$lib/utils/impactmap/impactDataMap.js';
	import { palettes } from '$lib/utils/colorPalettes.js';
	import { onMount } from 'svelte';

	// State for menu selections
	let selectedCategory = $state(Object.keys(impactMenus)[0]);
	let selectedOverlay = $state('');
	let selectedDestination = $state('');

	// Update destination when category changes
	$effect(() => {
		if (selectedCategory) {
			const menuData = impactMenus[selectedCategory];
			selectedOverlay = '';
			const firstKey = Object.keys(menuData)[0];
			if (typeof menuData[firstKey] === 'string') {
				// This is a simple category (Demographics/Travel Time/Impact)
				selectedDestination = firstKey;
			}
		}
	});

	// Update the state when selections change
	$effect(() => {
		if (!selectedCategory) return;

		const menuData = impactMenus[selectedCategory];
		let dataKey = menuData[selectedDestination];

		if (dataKey) {
			impactMapState.dataMapKey = dataKey;
			impactMapState.dataName = selectedDestination;
			impactMapState.menuState = selectedCategory;
		}
	});

	// Get destinations for current selection
	function getDestinationOptions() {
		if (!selectedCategory) return [];
		const menuData = impactMenus[selectedCategory];
		return Object.keys(menuData || {});
	}

	// Get legend data for current selection
	function getLegendData() {
		if (!impactMapState.dataMapKey || !impactDataMap[impactMapState.dataMapKey]) {
			return null;
		}
		
		const data = impactDataMap[impactMapState.dataMapKey];
		const metaInfo = data.meta_info;
		const styleStops = data.data_info.style_stops;
		
		if (!metaInfo.legend_labels || !styleStops) {
			return null;
		}
		
		// Get color palette
		const colorScale = metaInfo.color_scale;
		const reverse = metaInfo.reverse_color_scale;
		const palette = reverse ? [...palettes[colorScale]].reverse() : palettes[colorScale];
		
		return {
			labels: metaInfo.legend_labels,
			colors: palette,
			stops: styleStops,
			unit: metaInfo.unit || ''
		};
	}

	// Reactive legend data
	let legendData = $derived(getLegendData());

	// Initialize from state
	onMount(() => {
		// Set initial selections from state if available
		if (impactMapState.dataMapKey) {
			// Find the matching key in impactMenus
			Object.entries(impactMenus).forEach(([category, data]) => {
				Object.entries(data).forEach(([dest, key]) => {
					if (key === impactMapState.dataMapKey) {
						selectedCategory = category;
						selectedDestination = dest;
						return;
					}
				});
			});
		}
	});
</script>

<div class="space-y-4">
	<!-- Data Overlay Category Menu -->
	<div>
		<p class="font-bold">Data Overlay Category</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={selectedCategory}>
				{#each Object.keys(impactMenus) as category}
					<option value={category}>
						{category}
					</option>
				{/each}
			</select>
		</div>
	</div>


	<!-- Destination Type Menu -->
	<div>
		<p class="font-bold">
			{#if selectedCategory === 'Travel Time' || selectedCategory === 'Impact'}
				Destination Type
			{:else if selectedCategory === 'Demographics'}
				Demographic Data
			{:else if selectedCategory === 'Population'}
				Population Data
			{/if}
		</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={selectedDestination}>
				{#each getDestinationOptions() as destination}
					<option value={destination}>
						{destination}
					</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Legend -->
	{#if legendData}
		<div class="mt-6 pt-4 border-t border-gray-300">
			<p class="font-bold mb-3">Legend</p>
			<div class="space-y-2">
				<!-- Legend gradient bar -->
				<div class="relative h-6 rounded" style="background: linear-gradient(to right, {legendData.colors.join(', ')});">
				</div>
				
				<!-- Legend labels -->
				<div class="flex justify-between text-sm font-mono">
					<span>{legendData.labels[0]}</span>
					<span>{legendData.labels[1]}</span>
				</div>
				
				<!-- Legend values (style stops) -->
				<div class="flex justify-between text-xs text-gray-600 font-mono">
					<span>{legendData.stops[0]}{legendData.unit}</span>
					<span>{legendData.stops[1]}</span>
					<span>{legendData.stops[2]}</span>
					<span>{legendData.stops[3]}</span>
					<span>{legendData.stops[4]}{legendData.unit}</span>
				</div>
			</div>
		</div>
	{/if}
</div>
