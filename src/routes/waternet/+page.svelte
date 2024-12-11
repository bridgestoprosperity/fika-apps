<script>
	import WaterNetMap from '$lib/components/WaterNetMap.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	import b2pLogo from '$lib/images/b2p-full-logo.png';
	import bplLogo from '$lib/images/bpl-logo.png';
	import { palettes } from '$lib/colorPalettes';
	import { waternetMapState } from '$lib/state.svelte';
	import { vectorWaternet, rasterWaternet, satelliteImagery } from './WaternetMapStyling';

</script>

<div class="relative h-screen w-full">
	<WaterNetMap />
	<div class="absolute left-0 top-[30%] z-10">
		<ControlPanel>
			<div class="justify-left flex items-center">
				<img src={b2pLogo} alt="Bridges to Prosperity" class="mx-2 h-auto w-[40%]" />
				<img src={bplLogo} alt="Bridging the Prosperity Gap" class="mx-2 h-auto w-[45%]" />
			</div>

			<p class="font-medium">Data Visualized</p>
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text font-mono">Raster Data</span>
					<input
						type="checkbox"
						class="toggle toggle-primary [--tglbg:#e8e8e8]"
						on:change={(e) => (waternetMapState.rasterData = e.target.checked)}
						checked={waternetMapState.rasterData} />
				</label>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text font-mono">Satellite Imagery</span>
					<input
						type="checkbox"
						class="toggle toggle-primary [--tglbg:#e8e8e8]"
						on:change={(e) => (waternetMapState.satelliteImagery = e.target.checked)}
						checked={waternetMapState.satelliteImagery} />
				</label>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text font-mono">Vector Data</span>
					<input
						type="checkbox"
						class="toggle toggle-primary [--tglbg:#e8e8e8]"
						on:change={(e) => (waternetMapState.vectorData = e.target.checked)}
						checked={waternetMapState.vectorData} />
				</label>
			</div>
			<div class="form-control">
				{#if waternetMapState.vectorData == true || waternetMapState.satelliteImagery == true || waternetMapState.rasterData == true}
					<div class="divider"></div>
				{/if}
				{#if waternetMapState.rasterData == true}
					<div class="label">
						<span class="label-text">Raster Data Style</span>
					</div>
					<select
						class="select select-bordered select-primary p-2"
						value={waternetMapState.selectedPalette}
						on:change={(e) => (waternetMapState.selectedPalette = e.target.value)}>
						{#each Object.keys(palettes) as paletteName}
							<option value={paletteName}>{paletteName}</option>
						{/each}
					</select>
				{/if}
				{#if waternetMapState.satelliteImagery == true}
					<div class="label">
						<span class="label-text">Satellite Data Style</span>
					</div>
					<select
						class="select select-bordered select-primary p-2"
						value={waternetMapState.satStyle}
						on:change={(e) => (waternetMapState.satStyle = e.target.value)}>
						<option>Black and White</option>
						<option>Color</option>
					</select>
				{/if}
				{#if waternetMapState.vectorData == true}
					<div class="label">
						<span class="label-text">Vector Data Style</span>
					</div>
					<select
						class="select select-bordered select-primary p-2"
						value={waternetMapState.vectorStyle}
						on:change={(e) => (waternetMapState.vectorStyle = e.target.value)}>
						<option>Stream Order</option>
						<option>TDX Hydro Comparison</option>
					</select>

					<div class="divider"></div>
					<div class="label">
						<div class="font-mono text-lg font-bold text-gray-800">
							Stream Order: {waternetMapState.streamOrder}
						</div>
					</div>
				{/if}
			</div>
		</ControlPanel>
	</div>
</div>