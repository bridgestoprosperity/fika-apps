<script>
	import { onMount, onDestroy } from 'svelte';
	import { MapController } from '$lib/services/zambiademo/MapController.svelte.js';

	let mapContainer;
	let mapController;

	onMount(() => {
		mapController = new MapController(mapContainer);
	});

	onDestroy(() => {
		if (mapController) {
			mapController.cleanup();
		}
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={mapContainer} class="absolute inset-0 h-full w-full"></div>
</div>
