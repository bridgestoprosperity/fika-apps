<script>
	import { saiMapState } from '$lib/utils/state.svelte.js';
	import { palettes } from '$lib/utils/colorPalettes';
	import { vizOptions } from '$lib/utils/saiMapProperties';
	import ColorPaletteBar from '$lib/components/ColorPaletteBar.svelte';

	// Create an array of all available columns for visualization
	const allColumns = [
		// Base/demographic columns
		'population',
		'rwi',
		'underweight',
		'births',
		'pregnancies',
		'pop_0_4',
		'females_0_4',
		'males_0_4',
		'pop_5_9',
		'females_5_9',
		'males_5_9',
		'pop_10_14',
		'females_10_14',
		'males_10_14',
		'pop_0_9',
		'females_0_9',
		'males_0_9',
		'pop_15_49',
		'females_15_49',
		'males_15_49',
		'pop_50_64',
		'females_50_64',
		'males_50_64',
		'pop_65_plus',
		'females_65_plus',
		'males_65_plus',
		'female_educational_attainment_mean',
		'male_educational_attainment_mean',

		// Travel time columns
		'travel_time',
		'travel_time_no_sites',
		'time_delta_no_sites',
		'travel_time_no_sites_all_health',
		'time_delta_no_sites_semi_dense_urban',
		'travel_time_health_posts',
		'travel_time_major_roads',
		'travel_time_no_sites_secondary_schools',
		'travel_time_secondary_schools',
		'travel_time_no_sites_health_centers',
		'travel_time_no_sites_major_roads',
		'time_delta_no_sites_secondary_schools',
		'time_delta_no_sites_all_health',
		'travel_time_health_centers',
		'time_delta_no_sites_health_centers',
		'time_delta_no_sites_major_roads',
		'travel_time_semi_dense_urban',
		'time_delta_no_sites_major_hospitals',
		'travel_time_all_health',
		'travel_time_no_sites_primary_schools',
		'travel_time_no_sites_semi_dense_urban',
		'time_delta_no_sites_health_posts',
		'travel_time_no_sites_all_education',
		'travel_time_major_hospitals',
		'travel_time_no_sites_major_hospitals',
		'travel_time_primary_schools',
		'time_delta_no_sites_primary_schools',
		'travel_time_all_education',
		'time_delta_no_sites_all_education',
		'travel_time_no_sites_health_posts'
	];

	// Group columns by category for the dropdown
	const columnGroups = {
		Population: allColumns.filter(
			(col) =>
				col === 'population' ||
				col.startsWith('pop_') ||
				col.includes('females_') ||
				col.includes('males_')
		),
		'Health Indicators': ['births', 'pregnancies', 'underweight', 'rwi'],
		Education: ['female_educational_attainment_mean', 'male_educational_attainment_mean'],
		'Travel Time': allColumns.filter(
			(col) => col.startsWith('travel_time') && !col.includes('no_sites')
		),
		'Travel Time (No Sites)': allColumns.filter((col) => col.startsWith('travel_time_no_sites')),
		'Time Delta': allColumns.filter((col) => col.startsWith('time_delta'))
	};

	// Create a derived value for the current visualization's properties
	let currentVizProps = $derived.by(() => {
		const selectedViz = saiMapState.selectedViz;
		let vizName = selectedViz;

		// Map visualization columns to their base property sets
		if (selectedViz.startsWith('travel_time_no_sites_')) {
			vizName = 'travel_time_no_sites';
		} else if (selectedViz.startsWith('travel_time_') && selectedViz !== 'travel_time') {
			vizName = 'travel_time';
		} else if (selectedViz.startsWith('time_delta_no_sites_')) {
			vizName = 'time_delta_no_sites';
		}

		// Return the visualization properties or default to population if not found
		return vizOptions[vizName] || vizOptions['population'];
	});
</script>

<div class="space-y-4">
	<!-- Visualization Selection -->
	<div>
		<p class="font-bold">Data Visualized</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={saiMapState.selectedViz}>
				{#each Object.entries(columnGroups) as [groupName, columns]}
					<optgroup label={groupName}>
						{#each columns as column}
							<option value={column}>
								{column.replace(/_/g, ' ')}
							</option>
						{/each}
					</optgroup>
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
		<label class="label mt-0 cursor-pointer pt-0">
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
					{#if key === saiMapState.selectedViz || ['population', 'rwi', 'underweight', 'births', 'pregnancies'].includes(key)}
						<p>{key.replace(/_/g, ' ')}: {value}</p>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
