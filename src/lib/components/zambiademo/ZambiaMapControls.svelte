<script>
	import { zambiaMapState } from '$lib/utils/state.svelte.js';
	import { zambiaMenus } from '$lib/utils/zambiademo/zambiaMenus.js';
	import { zambiaDataMap } from '$lib/utils/zambiademo/zambiaDataMap.js';
	import { palettes } from '$lib/utils/colorPalettes.js';
	import { onMount } from 'svelte';

	let selectedCategory = $state(Object.keys(zambiaMenus)[0]);
	let selectedItem = $state('');

	// Set initial item when category changes
	$effect(() => {
		if (selectedCategory) {
			const menuData = zambiaMenus[selectedCategory];
			const firstKey = Object.keys(menuData)[0];
			selectedItem = firstKey;
		}
	});

	// Update state when selection changes
	$effect(() => {
		if (!selectedCategory || !selectedItem) return;
		const menuData = zambiaMenus[selectedCategory];
		const metric = menuData[selectedItem];
		if (metric) {
			zambiaMapState.selectedMetric = metric;
		}
	});

	function getItemOptions() {
		if (!selectedCategory) return [];
		return Object.keys(zambiaMenus[selectedCategory] || {});
	}

	function getLegendData() {
		const metric = zambiaMapState.selectedMetric;
		if (!metric || !zambiaDataMap[metric]) return null;

		const data = zambiaDataMap[metric];
		const metaInfo = data.meta_info;
		const styleStops = data.data_info.style_stops;

		if (!metaInfo.legend_labels || !styleStops) return null;

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

	let legendData = $derived(getLegendData());

	onMount(() => {
		// Ensure initial metric is set
		if (!zambiaMapState.selectedMetric) {
			const firstCategory = Object.keys(zambiaMenus)[0];
			const firstItem = Object.keys(zambiaMenus[firstCategory])[0];
			zambiaMapState.selectedMetric = zambiaMenus[firstCategory][firstItem];
		}
	});
</script>

<div class="space-y-4">
	<!-- Category selector -->
	<div>
		<p class="font-bold">Data Category</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={selectedCategory}>
				{#each Object.keys(zambiaMenus) as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Metric selector -->
	<div>
		<p class="font-bold">
			{#if selectedCategory === 'Travel Time' || selectedCategory === 'Impact'}
				Destination Type
			{:else}
				Metric
			{/if}
		</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={selectedItem}>
				{#each getItemOptions() as item}
					<option value={item}>{item}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Legend -->
	{#if legendData}
		<div class="mt-6 border-t border-gray-300 pt-4">
			<p class="mb-3 font-bold">Legend</p>
			<div class="space-y-2">
				<div
					class="relative h-6 rounded"
					style="background: linear-gradient(to right, {legendData.colors.join(', ')});">
				</div>
				<div class="flex justify-between font-mono text-sm">
					<span>{legendData.labels[0]}</span>
					<span>{legendData.labels[1]}</span>
				</div>
				<div class="flex justify-between font-mono text-xs text-gray-600">
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
