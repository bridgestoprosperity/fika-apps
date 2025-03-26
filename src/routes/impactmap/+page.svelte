<script>
	import { generalState } from '$lib/utils/state.svelte';
	import ImpactMap from './ImpactMap.svelte';
	import ImpactMapControls from './ImpactMapControls.svelte';
</script>

<div class="relative flex h-screen w-full flex-col md:flex-row">
	<div
		class="absolute bottom-4 left-4 z-10 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-lg md:static md:h-full md:w-80 md:rounded-none md:shadow-none"
		class:hidden={!generalState.controlPanelOpen}
	>
		<ImpactMapControls />
	</div>
	<div class="relative flex-grow">
		<ImpactMap />
	</div>
</div>