<script>
	import WaterNetMap from '$lib/components/WaterNetMap.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	import b2pLogo from '$lib/images/b2p-full-logo.png';
	import bplLogo from '$lib/images/bpl-logo.png';
	import { palettes } from '$lib/colorPalettes';

	let vectorData = $state(true);
	let rasterData = $state(true);
	let selectedPalette = $state('inferno');
	let satelliteImagery = $state(true);
	let satStyle = $state('Color');
	let streamOrder = $state(0);
	console.log(palettes);
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
					<span class="label-text font-mono">Vector Data</span>
					<input
						type="checkbox"
						class="toggle toggle-primary [--tglbg:#e8e8e8]"
						bind:checked={vectorData} />
				</label>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text font-mono">Raster Data</span>
					<input
						type="checkbox"
						class="toggle toggle-primary [--tglbg:#e8e8e8]"
						bind:checked={rasterData} />
				</label>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text font-mono">Satellite Imagery</span>
					<input
						type="checkbox"
						class="toggle toggle-primary [--tglbg:#e8e8e8]"
						bind:checked={satelliteImagery} />
				</label>
			</div>
			<div class="divider"></div>
			<!-- add a raster data style select -->
			<div class="form-control">
				{#if rasterData == true}
					<div class="label">
						<span class="label-text">Raster Data Style</span>
					</div>
					<select class="select select-bordered select-primary p-2" bind:value={selectedPalette}>
						{#each Object.keys(palettes) as paletteName}
							<option value={paletteName}>{paletteName}</option>
						{/each}
					</select>
				{/if}
				{#if satelliteImagery == true}
					<div class="label">
						<span class="label-text">Raster Data Style</span>
					</div>
					<select class="select select-bordered select-primary p-2" bind:value={satStyle}>
						<option> Black and White</option>
						<option> Color</option>

					</select>
				{/if}
				{#if vectorData == true}
					<div class="divider"></div>
					<div class="label">
						<div class="font-mono text-lg font-bold text-gray-800">
							Stream Order: {streamOrder}
						</div>
					</div>
				{/if}
			</div>
		</ControlPanel>
	</div>
</div>
