<script>
	import { saiMapState } from '$lib/utils/state.svelte.js';
	import { palettes } from '$lib/utils/colorPalettes';
	import { vizOptions } from '$lib/utils/saiMapProperties';
	import ColorPaletteBar from '$lib/components/ColorPaletteBar.svelte';

	// Create a derived value for the current visualization's properties
	let currentVizProps = $derived(vizOptions[saiMapState.selectedViz]);
</script>

<div class="space-y-4">
	<!-- Visualization Selection -->
	<div>
		<p class="font-bold">Data Visualized</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={saiMapState.selectedViz}>
				{#each Object.entries(vizOptions) as [vizName, vizProps]}
					<option value={vizName}>
						{vizName.replace(/_/g, ' ')}
					</option>
				{/each}
			</select>
		</div>

		<!-- statistics display -->
		{#if currentVizProps}
			<div class="mt-2 space-y-1 text-sm">
				<p>Mean: {currentVizProps.mean.toFixed(2)}</p>
				<p>Range: {currentVizProps.min.toFixed(2)} - {currentVizProps.max.toFixed(2)}</p>
			</div>
		{/if}
	</div>


	<div>
		<div class="label">
			<span class="label-text">Data Color Scheme</span>
		</div>

		<div class="mb-2">
			<ColorPaletteBar
				colors={palettes[saiMapState.selectedPalette]}
				name={saiMapState.selectedPalette} />
		</div>
		<select
			class="select select-bordered select-secondary w-full bg-transparent p-1 font-mono"
			bind:value={saiMapState.selectedPalette}>
			{#each Object.keys(palettes) as paletteName}
				<option value={paletteName}>
					{paletteName}
				</option>
			{/each}
		</select>
	</div>
	<div class="form-control mt-0">
		<label class="label cursor-pointer mt-0 pt-0">
			<span class="font-normal">Reverse</span>
			<input
				type="checkbox"
				class="toggle toggle-primary [--tglbg:#e8e8e8]"
				onchange={(e) => (saiMapState.reversePalette = e.target.checked)}
				checked={saiMapState.reversePalette} />
		</label>
	</div>
	<!-- if sasiMapState.clickedData doesn't = {} add it it below -->
	{#if Object.keys(saiMapState.clickedData).length > 0}
		<div>
			<p class="font-bold">Selected Feature</p>
			<div class="mt-3 space-y-1 text-sm">
				{#each Object.entries(saiMapState.clickedData) as [key, value]}
					{#if ['travel_time_no_sites', 'travel_time', 'time_delta_no_sites', 'population', 'underweight', 'rwi'].includes(key)}
						<p>{key}: {value}</p>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
