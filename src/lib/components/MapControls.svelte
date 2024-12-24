<script>
	import { waternetMapState } from '$lib/utils/state.svelte.js';
	import { palettes } from '$lib/utils/colorPalettes';
	import b2pLogo from '$lib/images/b2p-full-logo.png';
	import bplLogo from '$lib/images/bpl-logo.png';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
</script>

<div class="absolute left-16 top-[150px] z-40">
	<ControlPanel>
		<!-- Logo Section -->
		<!-- <div class="justify-left flex items-center">
			<img src={b2pLogo} alt="Bridges to Prosperity" class="mx-2 h-auto w-[40%]" />
			<img src={bplLogo} alt="Bridging the Prosperity Gap" class="mx-2 h-auto w-[45%]" />
		</div> -->

		<!-- Data Visualization Controls -->
		<p class="font-bold">Data Visualized</p>

		<!-- Raster Toggle -->
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="font-normal">Raster Data</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					on:change={(e) => (waternetMapState.visibility.rasterData = e.target.checked)}
					checked={waternetMapState.visibility.rasterData} />
			</label>
		</div>
		<div class="divider" ></div>
		<!-- Satellite Toggle -->
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="font-normal">Satellite Imagery</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					on:change={(e) => (waternetMapState.visibility.satelliteImagery = e.target.checked)}
					checked={waternetMapState.visibility.satelliteImagery} />
			</label>
		</div>

		<!-- Vector Toggle -->
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="font-normal">Vector Data</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					on:change={(e) => (waternetMapState.visibility.vectorData = e.target.checked)}
					checked={waternetMapState.visibility.vectorData} />
			</label>
		</div>
		<div class="form-control">
			{#if waternetMapState.visibility.vectorData || waternetMapState.visibility.satelliteImagery || waternetMapState.visibility.rasterData}
				<div class="divider  my-0"></div>
			{/if}

			{#if waternetMapState.visibility.rasterData}
				<div class="label">
					<span class="label-text">Raster Data Style</span>
				</div>
				<select
					class="select select-bordered select-secondary p-1 font-mono bg-transparent"
					bind:value={waternetMapState.style.selectedPalette}>
					{#each Object.keys(palettes) as paletteName}
						<option value={paletteName}>{paletteName}</option>
					{/each}
				</select>
			{/if}

			<!-- Satellite Style Controls -->
			{#if waternetMapState.visibility.satelliteImagery}
				<div class="label">
					<span class="label-text">Satellite Data Style</span>
				</div>
				<select
					class="select select-bordered select-secondary font-mono p-2 bg-transparent"
					bind:value={waternetMapState.style.satStyle}>
					<option>Black and White</option>
					<option>Color</option>
				</select>
			{/if}

			<!-- Vector Style Controls -->
			{#if waternetMapState.visibility.vectorData}
				<div class="label">
					<span class="label-text">Vector Data Style</span>
				</div>
				<select
					class="select select-bordered select-secondary p-2 font-mono bg-transparent"
					bind:value={waternetMapState.style.vectorStyle}>
					<option>Stream Order</option>
					<option>TDX Hydro Comparison</option>
				</select>
				<div class="label">
					<span class="label-text">Stream Order Threshold</span>
				</div>
				<input
					type="range"
					min="1"
					max="12"
					bind:value={waternetMapState.style.streamOrderThreshold}
					class="range range-secondary"
					step="1" />

				<div class="flex w-full justify-between px-2 text-xs">
					<span>12</span>
					<span>|</span>
					<span>|</span>
					<span>|</span>
					<span>8</span>
					<span>|</span>
					<span>|</span>
					<span>5</span>
					<span>|</span>
					<span>|</span>
					<span>|</span>
					<span>1</span>
				</div>

				<div class="divider mt-2 mb-0"></div>

				<div class="label">
					<div class="font-mono text-sm font-bold text-gray-800">
						Hovered Stream Order: {waternetMapState.style.streamOrderValue}
					</div>
				</div>
			{/if}
		</div>
	</ControlPanel>
</div>

<style>
	/* Add any component-specific styles here */
</style>
