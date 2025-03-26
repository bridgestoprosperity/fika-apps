<script>
	import { impactMapState } from '$lib/utils/state.svelte';
	import { palettes } from '$lib/utils/colorPalettes';
	import ColorPaletteBar from '$lib/components/ColorPaletteBar.svelte';

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
		impactMapState.filterByYear = false;
		impactMapState.yearRange = [2010, 2024];
	}
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto">
	<h2 class="text-xl font-bold text-primary">Impact Map</h2>
	
	{#if impactMapState.dataCount > 0}
		<p class="text-sm text-gray-600">Showing {impactMapState.dataCount} bridges</p>
	{/if}
	
	<!-- Layer selector -->
	<div class="form-control">
		<label class="label">
			<span class="label-text font-semibold">Bridge Layer</span>
		</label>
		<select 
			class="select select-bordered w-full" 
			bind:value={impactMapState.selectedLayer}
		>
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
			bind:value={impactMapState.selectedPalette}
		>
			{#each availablePalettes as palette}
				<option value={palette.value}>{palette.label}</option>
			{/each}
		</select>
		
		<!-- Color palette preview -->
		<div class="mt-2">
			<ColorPaletteBar palette={palettes[impactMapState.selectedPalette]} />
		</div>
	</div>

	<!-- Year filter -->
	<div class="form-control">
		<label class="label cursor-pointer">
			<span class="label-text font-semibold">Filter by Year</span>
			<input type="checkbox" class="toggle toggle-primary" bind:checked={impactMapState.filterByYear} />
		</label>
		
		{#if impactMapState.filterByYear}
			<div class="mt-2">
				<label class="label">
					<span class="label-text">Year Range: {impactMapState.yearRange[0]} - {impactMapState.yearRange[1]}</span>
				</label>
				<input 
					type="range" 
					min="2010" 
					max="2024" 
					bind:value={impactMapState.yearRange[0]} 
					class="range range-xs range-primary" 
				/>
				<input 
					type="range" 
					min="2010" 
					max="2024" 
					bind:value={impactMapState.yearRange[1]} 
					class="range range-xs range-primary mt-2" 
				/>
			</div>
		{/if}
	</div>

	<!-- Satellite imagery toggle -->
	<div class="form-control">
		<label class="label cursor-pointer">
			<span class="label-text font-semibold">Satellite Imagery</span>
			<input type="checkbox" class="toggle toggle-primary" bind:checked={impactMapState.satelliteImagery} />
		</label>
	</div>

	<!-- Reset button -->
	<button class="btn btn-outline mt-auto" on:click={resetFilters}>
		Reset Filters
	</button>
</div>