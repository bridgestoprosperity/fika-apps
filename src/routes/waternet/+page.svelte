<script lang="ts">
	import Map from '$lib/components/map/Map.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	import LayerControls from '$lib/components/controls/LayerControls.svelte';
	import b2pLogo from '$lib/images/b2p-full-logo.png';
	import bplLogo from '$lib/images/bpl-logo.png';
</script>

<div class="relative h-screen w-full">
	<div class="absolute inset-0">
		<Map />
	</div>

	<div class="absolute left-0 top-[30%] z-10">
		<ControlPanel>
			<header class="mb-4 flex items-center justify-start">
				<img src={b2pLogo} alt="Bridges to Prosperity" class="mx-2 h-auto w-[40%]" />
				<img src={bplLogo} alt="Bridging the Prosperity Gap" class="mx-2 h-auto w-[45%]" />
			</header>

			<LayerControls />
		</ControlPanel>
	</div>
</div>

<style>
	/* Add any page-specific styles here */
</style>
