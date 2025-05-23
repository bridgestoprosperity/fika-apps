<script>
	import { hexMapState } from '$lib/utils/state.svelte.js';
	import { palettes } from '$lib/utils/colorPalettes';
	import { vizOptions } from '$lib/utils/hexMapProperties';
	import ColorPaletteBar from '$lib/components/ColorPaletteBar.svelte';

	// Create a derived value for the current visualization's properties
	let currentVizProps = $derived(vizOptions[hexMapState.selectedViz]);
</script>

<div class="space-y-4">
	<!-- Visualization Selection -->
	<div>
		<p class="font-bold">Data Visualized</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={hexMapState.selectedViz}>
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

	<!-- Color Palette Selection -->
	<div>
		<div class="label">
			<span class="label-text">Data Color Scheme</span>
		</div>

		<div class="mb-2">
			<ColorPaletteBar
				colors={palettes[hexMapState.selectedPalette]}
				name={hexMapState.selectedPalette} />
		</div>
		<select
			class="select select-bordered select-secondary w-full bg-transparent p-1 font-mono"
			bind:value={hexMapState.selectedPalette}>
			{#each Object.keys(palettes) as paletteName}
				<option value={paletteName}>
					{paletteName}
				</option>
			{/each}
		</select>
	</div>

	<!-- Reverse Palette Toggle -->
	<div class="form-control mt-0">
		<label class="label mt-0 cursor-pointer pt-0">
			<span class="font-normal">Reverse</span>
			<input
				type="checkbox"
				class="toggle toggle-primary [--tglbg:#e8e8e8]"
				onchange={(e) => (hexMapState.reversePalette = e.target.checked)}
				checked={hexMapState.reversePalette} />
		</label>
	</div>

	<!-- Selected Hex Data Display -->
	{#if Object.keys(hexMapState.clickedData).length > 0}
		<div>
			<p class="font-bold">Selected Hexagon</p>
			<div class="mt-3 space-y-1 text-sm">
				{#each Object.entries(hexMapState.clickedData) as [key, value]}
					{#if ['population', 'travel_time', 'travel_time_no_sites', 'time_delta_no_sites'].includes(key)}
						<p>{key.replace(/_/g, ' ')}: {value}</p>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
