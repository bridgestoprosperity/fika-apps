<script>
	import { saiMapState } from '$lib/utils/state.svelte.js';
	import { palettes } from '$lib/utils/colorPalettes';
	import { vizOptions } from '$lib/utils/saiMapProperties';
	import ColorPaletteBar from '$lib/components/ColorPaletteBar.svelte';

	// Structured category/option definitions with human-readable labels
	const categories = [
		{
			id: 'walking_time_no_bridges',
			label: 'Walking time w/o bridges',
			options: [
				{ value: 'travel_time_no_sites_major_roads', label: 'To major roads' },
				{ value: 'travel_time_no_sites_health_centers', label: 'To health centers' },
				{ value: 'travel_time_no_sites_major_hospitals', label: 'To major hospitals' },
				{ value: 'travel_time_no_sites_health_posts', label: 'To health posts' },
				{ value: 'travel_time_no_sites_all_health', label: 'To all health facilities' },
				{ value: 'travel_time_no_sites_primary_schools', label: 'To primary schools' },
				{ value: 'travel_time_no_sites_secondary_schools', label: 'To secondary schools' },
				{ value: 'travel_time_no_sites_all_education', label: 'To all education facilities' },
				{ value: 'travel_time_no_sites_semi_dense_urban', label: 'To urban areas' }
			]
		},
		{
			id: 'walking_time_with_bridges',
			label: 'Walking time with bridges',
			options: [
				{ value: 'travel_time_major_roads', label: 'To major roads' },
				{ value: 'travel_time_health_centers', label: 'To health centers' },
				{ value: 'travel_time_major_hospitals', label: 'To major hospitals' },
				{ value: 'travel_time_health_posts', label: 'To health posts' },
				{ value: 'travel_time_all_health', label: 'To all health facilities' },
				{ value: 'travel_time_primary_schools', label: 'To primary schools' },
				{ value: 'travel_time_secondary_schools', label: 'To secondary schools' },
				{ value: 'travel_time_all_education', label: 'To all education facilities' },
				{ value: 'travel_time_semi_dense_urban', label: 'To urban areas' }
			]
		},
		{
			id: 'time_saved',
			label: 'Walking time saved by trail bridges',
			options: [
				{ value: 'time_delta_no_sites_major_roads', label: 'To major roads' },
				{ value: 'time_delta_no_sites_health_centers', label: 'To health centers' },
				{ value: 'time_delta_no_sites_major_hospitals', label: 'To major hospitals' },
				{ value: 'time_delta_no_sites_health_posts', label: 'To health posts' },
				{ value: 'time_delta_no_sites_all_health', label: 'To all health facilities' },
				{ value: 'time_delta_no_sites_primary_schools', label: 'To primary schools' },
				{ value: 'time_delta_no_sites_secondary_schools', label: 'To secondary schools' },
				{ value: 'time_delta_no_sites_all_education', label: 'To all education facilities' },
				{ value: 'time_delta_no_sites_semi_dense_urban', label: 'To urban areas' }
			]
		},
		{
			id: 'population',
			label: 'Population data',
			options: [
				{ value: 'population', label: 'Total population' },
				{ value: 'pop_0_4', label: 'Age 0-4' },
				{ value: 'females_0_4', label: 'Females age 0-4' },
				{ value: 'males_0_4', label: 'Males age 0-4' },
				{ value: 'pop_5_9', label: 'Age 5-9' },
				{ value: 'females_5_9', label: 'Females age 5-9' },
				{ value: 'males_5_9', label: 'Males age 5-9' },
				{ value: 'pop_10_14', label: 'Age 10-14' },
				{ value: 'females_10_14', label: 'Females age 10-14' },
				{ value: 'males_10_14', label: 'Males age 10-14' },
				{ value: 'pop_0_9', label: 'Age 0-9' },
				{ value: 'females_0_9', label: 'Females age 0-9' },
				{ value: 'males_0_9', label: 'Males age 0-9' },
				{ value: 'pop_15_49', label: 'Age 15-49' },
				{ value: 'females_15_49', label: 'Females age 15-49' },
				{ value: 'males_15_49', label: 'Males age 15-49' },
				{ value: 'pop_50_64', label: 'Age 50-64' },
				{ value: 'females_50_64', label: 'Females age 50-64' },
				{ value: 'males_50_64', label: 'Males age 50-64' },
				{ value: 'pop_65_plus', label: 'Age 65+' },
				{ value: 'females_65_plus', label: 'Females age 65+' },
				{ value: 'males_65_plus', label: 'Males age 65+' }
			]
		},
		{
			id: 'demographics',
			label: 'Demographic & other indicators',
			options: [
				{ value: 'births', label: 'Births' },
				{ value: 'pregnancies', label: 'Pregnancies' },
				{ value: 'underweight', label: 'Underweight prevalence' },
				{ value: 'rwi', label: 'Relative wealth index' },
				{ value: 'female_educational_attainment_mean', label: 'Female educational attainment (mean)' },
				{ value: 'male_educational_attainment_mean', label: 'Male educational attainment (mean)' }
			]
		}
	];

	// Find which category the current selectedViz belongs to
	function findCategoryForViz(viz) {
		for (const cat of categories) {
			if (cat.options.some((o) => o.value === viz)) return cat.id;
		}
		return categories[0].id;
	}

	let selectedCategory = $state(findCategoryForViz(saiMapState.selectedViz));

	let currentCategoryOptions = $derived(
		categories.find((c) => c.id === selectedCategory)?.options ?? []
	);

	function onCategoryChange(newCategoryId) {
		selectedCategory = newCategoryId;
		const cat = categories.find((c) => c.id === newCategoryId);
		if (cat && cat.options.length > 0) {
			saiMapState.selectedViz = cat.options[0].value;
		}
	}

	// Derived viz props for statistics display
	let currentVizProps = $derived.by(() => {
		const selectedViz = saiMapState.selectedViz;
		let vizName = selectedViz;

		if (selectedViz.startsWith('travel_time_no_sites_')) {
			vizName = 'travel_time_no_sites';
		} else if (selectedViz.startsWith('travel_time_') && selectedViz !== 'travel_time') {
			vizName = 'travel_time';
		} else if (selectedViz.startsWith('time_delta_no_sites_')) {
			vizName = 'time_delta_no_sites';
		}

		return vizOptions[vizName] || vizOptions['population'];
	});
</script>

<div class="space-y-4">
	<!-- Category Selection -->
	<div>
		<p class="font-bold">Category</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				value={selectedCategory}
				onchange={(e) => onCategoryChange(e.target.value)}>
				{#each categories as category}
					<option value={category.id}>{category.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Metric Selection -->
	<div>
		<p class="font-bold">Show on map</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={saiMapState.selectedViz}>
				{#each currentCategoryOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Statistics display -->
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
	<!-- Selected feature data -->
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
