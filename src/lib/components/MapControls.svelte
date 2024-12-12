<script>
	import { mapState } from '$lib/stores/mapStore.svelte';
	import { palettes } from '../colorPalettes';
	import b2pLogo from '../images/b2p-full-logo.png';
	import bplLogo from '../images/bpl-logo.png';
	import ControlPanel from './ControlPanel.svelte';
</script>

<div class="absolute left-0 top-[10px] z-10">
	<ControlPanel>
		<!-- Logo Section -->
		<div class="justify-left flex items-center">
			<img src={b2pLogo} alt="Bridges to Prosperity" class="mx-2 h-auto w-[40%]" />
			<img src={bplLogo} alt="Bridging the Prosperity Gap" class="mx-2 h-auto w-[45%]" />
		</div>

		<!-- Data Visualization Controls -->
		<p class="font-medium">Data Visualized</p>

		<!-- Raster Toggle -->
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text font-mono">Raster Data</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onchange={(e) => (mapState.rasterData = e.target.checked)}
					checked={mapState.rasterData} />
			</label>
		</div>

		<!-- Satellite Toggle -->
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text font-mono">Satellite Imagery</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onchange={(e) => (mapState.satelliteImagery = e.target.checked)}
					checked={mapState.satelliteImagery} />
			</label>
		</div>

		<!-- Vector Toggle -->
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text font-mono">Vector Data</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onchange={(e) => (mapState.vectorData = e.target.checked)}
					checked={mapState.vectorData} />
			</label>
		</div>

		<!-- Style Controls Section -->
		<div class="form-control">
			{#if mapState.vectorData || mapState.satelliteImagery || mapState.rasterData}
				<div class="divider"></div>
			{/if}

			<!-- Raster Style Controls -->
			{#if mapState.rasterData}
				<div class="label">
					<span class="label-text">Raster Data Style</span>
				</div>
				<select
					class="select select-bordered select-primary p-2"
					value={mapState.selectedPalette}
					onchange={(e) => (mapState.selectedPalette = e.target.value)}>
					{#each Object.keys(palettes) as paletteName}
						<option value={paletteName}>{paletteName}</option>
					{/each}
				</select>
			{/if}

			<!-- Satellite Style Controls -->
			{#if mapState.satelliteImagery}
				<div class="label">
					<span class="label-text">Satellite Data Style</span>
				</div>
				<select
					class="select select-bordered select-primary p-2"
					value={mapState.satStyle}
					onchange={(e) => (mapState.satStyle = e.target.value)}>
					<option>Black and White</option>
					<option>Color</option>
				</select>
			{/if}

			<!-- Vector Style Controls -->
			{#if mapState.vectorData}
				<div class="label">
					<span class="label-text">Vector Data Style</span>
				</div>
				<select
					class="select select-bordered select-primary p-2"
					value={mapState.vectorStyle}
					onchange={(e) => (mapState.vectorStyle = e.target.value)}>
					<option>Stream Order</option>
					<option>TDX Hydro Comparison</option>
				</select>

				<div class="divider"></div>

				<!-- Stream Order Display -->
				<div class="label">
					<div class="font-mono text-lg font-bold text-gray-800">
						Stream Order: {mapState.streamOrder}
					</div>
				</div>
			{/if}
		</div>
	</ControlPanel>
</div>
