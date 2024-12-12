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
		<div class="flex items-center justify-start space-x-6">
			<a
				href="https://bridgestoprosperity.org/"
				target="_blank"
				rel="noopener noreferrer"
				class="w-[40%] transition-opacity hover:opacity-80 focus:opacity-80">
				<img src={b2pLogo} alt="Bridges to Prosperity - Visit Homepage" class="h-auto w-full" />
			</a>

			<a
				href="https://betterplanetlab.com/"
				target="_blank"
				rel="noopener noreferrer"
				class="w-[45%] transition-opacity hover:opacity-80 focus:opacity-80">
				<img src={bplLogo} alt="Better Planet Lab - Visit Homepage" class="h-auto w-full" />
			</a>
		</div>

		<!-- Data Visualization Controls -->
		<h2 class="mb-2 text-lg font-semibold text-gray-800">Data Visualized</h2>

		<!-- Toggle Controls -->
		{#each [{ label: 'Raster Data', bind: 'rasterData' }, { label: 'Satellite Imagery', bind: 'satelliteImagery' }, { label: 'Vector Data', bind: 'vectorData' }] as { label, bind }}
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text text-sm text-gray-700">{label}</span>
					<input
						type="checkbox"
						class="toggle toggle-primary [--tglbg:#e8e8e8]"
						onchange={(e) => (mapState[bind] = e.target.checked)}
						checked={mapState[bind]} />
				</label>
			</div>
		{/each}

		<!-- Style Controls Section -->
		<div class="form-control">
			{#if mapState.vectorData || mapState.satelliteImagery || mapState.rasterData}
				<div class="divider" />
				<h2 class="mb-2 text-lg font-semibold text-gray-800">Data Styling</h2>
			{/if}

			<!-- Raster Style Controls -->
			{#if mapState.rasterData}
				<div class="space-y-2">
					<label class="text-sm font-medium text-gray-700">Raster Data Style</label>
					<select
						class="select select-bordered select-primary w-full text-sm"
						value={mapState.selectedPalette}
						onchange={(e) => (mapState.selectedPalette = e.target.value)}>
						{#each Object.keys(palettes) as paletteName}
							<option value={paletteName}>{paletteName}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Satellite Style Controls -->
			{#if mapState.satelliteImagery}
				<div class="space-y-2">
					<label class="text-sm font-medium text-gray-700">Satellite Data Style</label>
					<select
						class="select select-bordered select-primary w-full text-sm"
						value={mapState.satStyle}
						onchange={(e) => (mapState.satStyle = e.target.value)}>
						<option>Black and White</option>
						<option>Color</option>
					</select>
				</div>
			{/if}

			<!-- Vector Style Controls -->
			{#if mapState.vectorData}
				<div class="space-y-2">
					<label class="text-sm font-medium text-gray-700">Vector Data Style</label>
					<select
						class="select select-bordered select-primary w-full text-sm"
						value={mapState.vectorStyle}
						onchange={(e) => (mapState.vectorStyle = e.target.value)}>
						<option>Stream Order</option>
						<option>TDX Hydro Comparison</option>
					</select>

					<div class="divider" />

					<!-- Stream Order Display -->

					<span class="font-mono text-lg font-medium font-semibold text-gray-700"
						>Stream Order:</span>
					<span class="ml-2 font-mono text-lg font-semibold text-gray-900"
						>{mapState.streamOrder}</span>
				</div>
			{/if}
		</div>
	</ControlPanel>
</div>
