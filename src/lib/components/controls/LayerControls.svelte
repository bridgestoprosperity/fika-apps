<script lang="ts">
	import { mapState } from '$lib/stores/map-state.svelte';
	import { palettes } from '$lib/colorPalettes';

	let { children } = $props();
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<h3 class="font-medium">Layer Visibility</h3>
		<div class="space-y-1">
			<label class="flex items-center justify-between">
				<span class="font-mono">Vector Data</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onclick={(e) => (mapState.vectorData = e.currentTarget.checked)}
					checked={mapState.vectorData} />
			</label>

			<label class="flex items-center justify-between">
				<span class="font-mono">Raster Data</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onclick={(e) => (mapState.rasterData = e.currentTarget.checked)}
					checked={mapState.rasterData} />
			</label>

			<label class="flex items-center justify-between">
				<span class="font-mono">Satellite Imagery</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onclick={(e) => (mapState.satelliteImagery = e.currentTarget.checked)}
					checked={mapState.satelliteImagery} />
			</label>
		</div>
	</div>

	{#if mapState.rasterData || mapState.satelliteImagery || mapState.vectorData}
		<div class="divider"></div>
	{/if}

	{#if mapState.rasterData}
		<div class="space-y-2">
			<label class="block">
				<span class="text-sm">Raster Data Style</span>
				<select
					class="select select-bordered select-primary w-full"
					value={mapState.selectedPalette}
					onchange={(e) => (mapState.selectedPalette = e.currentTarget.value)}>
					{#each Object.keys(palettes) as paletteName}
						<option value={paletteName}>{paletteName}</option>
					{/each}
				</select>
			</label>
		</div>
	{/if}

	{#if mapState.satelliteImagery}
		<div class="space-y-2">
			<label class="block">
				<span class="text-sm">Satellite Style</span>
				<select
					class="select select-bordered select-primary w-full"
					value={mapState.satStyle}
					onchange={(e) =>
						(mapState.satStyle = e.currentTarget.value as 'Color' | 'Black and White')}>
					<option>Color</option>
					<option>Black and White</option>
				</select>
			</label>
		</div>
	{/if}

	{#if mapState.vectorData}
		<div class="space-y-2">
			<label class="block">
				<span class="text-sm">Vector Style</span>
				<select
					class="select select-bordered select-primary w-full"
					value={mapState.vectorStyle}
					onchange={(e) =>
						(mapState.vectorStyle = e.currentTarget.value as
							| 'Stream Order'
							| 'TDX Hydro Comparison')}>
					<option>Stream Order</option>
					<option>TDX Hydro Comparison</option>
				</select>
			</label>

			<div class="mt-4 font-mono text-lg font-bold text-gray-800">
				Stream Order: {mapState.streamOrder}
			</div>
		</div>
	{/if}
</div>
