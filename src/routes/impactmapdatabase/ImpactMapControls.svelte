<script>
	import { impactMapDatabaseState } from '$lib/utils/state.svelte';
	import { palettes } from '$lib/utils/colorPalettes';
	import ColorPaletteBar from '$lib/components/ColorPaletteBar.svelte';
	import { vizOptions } from '$lib/utils/hexMapProperties';

	// Add reactivity for state tracking
	$effect(() => {
		console.log('State changed:', JSON.stringify(impactMapDatabaseState, null, 2));
	});

	// Layer options
	const layerOptions = [
		{ value: 'bridges', label: 'All Bridges' },
		{ value: 'suspended', label: 'Suspended Bridges' },
		{ value: 'trailbridge', label: 'Trail Bridges' }
	];

	// Available color palettes
	const availablePalettes = [
		{ value: 'viridis', label: 'Viridis' },
		{ value: 'inferno', label: 'Inferno' },
		{ value: 'magma', label: 'Magma' },
		{ value: 'plasma', label: 'Plasma' },
		{ value: 'blues', label: 'Blues' },
		{ value: 'greens', label: 'Greens' }
	];

	// Reset filters
	function resetFilters() {
		impactMapDatabaseState.filterByYear = false;
		impactMapDatabaseState.yearRange = [2010, 2024];
		console.log('Filters reset, new state:', JSON.stringify(impactMapDatabaseState, null, 2));
	}
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto">
	<h2 class="text-xl font-bold text-primary">Impact Map</h2>

	{#if impactMapDatabaseState.dataCount > 0}
		<p class="text-sm text-gray-600">Showing {impactMapDatabaseState.dataCount} bridges</p>
	{/if}

	<!-- Layer selector -->
	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold">Bridge Layer</span>
		</label>
		<select class="select select-bordered w-full" bind:value={impactMapDatabaseState.selectedLayer}>
			{#each layerOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>

	<!-- Color palette selector -->
	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold">Color Palette</span>
		</label>
		<select
			class="select select-bordered w-full"
			bind:value={impactMapDatabaseState.selectedPalette}>
			{#each availablePalettes as palette}
				<option value={palette.value}>{palette.label}</option>
			{/each}
		</select>

		<!-- Color palette preview -->
		<div class="mt-2">
			<ColorPaletteBar palette={palettes[impactMapDatabaseState.selectedPalette]} />
		</div>
	</div>

	<!-- Year filter -->
	<div class="form-control">
		<label class="label cursor-pointer">
			<span class="label-text font-semibold">Filter by Year</span>
			<input
				type="checkbox"
				class="toggle toggle-primary"
				bind:checked={impactMapDatabaseState.filterByYear} />
		</label>

		{#if impactMapDatabaseState.filterByYear}
			<div class="mt-2">
				<label class="label">
					<span class="label-text"
						>Year Range: {impactMapDatabaseState.yearRange[0]} - {impactMapDatabaseState
							.yearRange[1]}</span>
				</label>
				<input
					type="range"
					min="2010"
					max="2024"
					bind:value={impactMapDatabaseState.yearRange[0]}
					class="range range-primary range-xs" />
				<input
					type="range"
					min="2010"
					max="2024"
					bind:value={impactMapDatabaseState.yearRange[1]}
					class="range range-primary range-xs mt-2" />
			</div>
		{/if}
	</div>

	<!-- Satellite imagery toggle -->
	<div class="form-control">
		<label class="label cursor-pointer">
			<span class="label-text font-semibold">Satellite Imagery</span>
			<input
				type="checkbox"
				class="toggle toggle-primary"
				bind:checked={impactMapDatabaseState.satelliteImagery} />
		</label>
	</div>

	<!-- Hex Data Layer - Simplified for focusing on just showing outlines -->
	<div class="form-control">
		<label class="label cursor-pointer">
			<span class="label-text font-semibold">Show Hex Grid</span>
			<input
				type="checkbox"
				class="toggle toggle-primary"
				bind:checked={impactMapDatabaseState.showHexLayer} />
		</label>
	</div>

	<!-- Reset button -->
	<button class="btn btn-outline mt-auto" on:click={resetFilters}> Reset Filters </button>
</div>
