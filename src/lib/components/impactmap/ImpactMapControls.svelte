<script>
	import { impactMapState } from '$lib/utils/state.svelte.js';
	import { impactMenus } from '$lib/utils/impactmap/impactMenus.js';
	import { onMount } from 'svelte';

	// State for menu selections
	let selectedCategory = $state(Object.keys(impactMenus)[0]);
	let selectedOverlay = $state('');
	let selectedDestination = $state('');

	// Update overlay when category changes
	$effect(() => {
		if (selectedCategory) {
			const menuData = impactMenus[selectedCategory];

			if (selectedCategory === 'Travel Time') {
				selectedOverlay = 'With Bridges';
				selectedDestination = Object.keys(menuData['With Bridges'])[0];
			} else {
				selectedOverlay = '';
				const firstKey = Object.keys(menuData)[0];
				if (typeof menuData[firstKey] === 'string') {
					// This is a simple category (Demographics/Population/Impact)
					selectedDestination = firstKey;
				}
			}
		}
	});

	// Update the state when selections change
	$effect(() => {
		if (!selectedCategory) return;

		const menuData = impactMenus[selectedCategory];
		let dataKey = '';

		if (selectedCategory === 'Travel Time') {
			dataKey = menuData[selectedOverlay]?.[selectedDestination];
		} else {
			dataKey = menuData[selectedDestination];
		}

		if (dataKey) {
			impactMapState.dataMapKey = dataKey;
			impactMapState.dataName = selectedDestination;
			impactMapState.menuState = selectedCategory;
		}
	});

	// Get available overlays for current category
	function getOverlayOptions() {
		if (selectedCategory !== 'Travel Time') return [];
		return Object.keys(impactMenus['Travel Time']);
	}

	// Get destinations for current selection
	function getDestinationOptions() {
		if (!selectedCategory) return [];

		const menuData = impactMenus[selectedCategory];

		if (selectedCategory === 'Travel Time' && selectedOverlay) {
			return Object.keys(menuData[selectedOverlay] || {});
		} else {
			return Object.keys(menuData || {});
		}
	}

	// Check if we should show the overlay menu
	let showOverlay = $derived(selectedCategory === 'Travel Time');

	// Initialize from state
	onMount(() => {
		// Set initial selections from state if available
		if (impactMapState.dataMapKey) {
			// Find the matching key in impactMenus
			Object.entries(impactMenus).forEach(([category, data]) => {
				if (category === 'Travel Time') {
					Object.entries(data).forEach(([overlay, destinations]) => {
						Object.entries(destinations).forEach(([dest, key]) => {
							if (key === impactMapState.dataMapKey) {
								selectedCategory = category;
								selectedOverlay = overlay;
								selectedDestination = dest;
								return;
							}
						});
					});
				} else {
					Object.entries(data).forEach(([dest, key]) => {
						if (key === impactMapState.dataMapKey) {
							selectedCategory = category;
							selectedDestination = dest;
							return;
						}
					});
				}
			});
		}
	});
</script>

<div class="space-y-4">
	<!-- Data Overlay Category Menu -->
	<div>
		<p class="font-bold">Data Overlay Category</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={selectedCategory}>
				{#each Object.keys(impactMenus) as category}
					<option value={category}>
						{category}
					</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Data Overlay Details Menu (only for Travel Time) -->
	{#if showOverlay}
		<div>
			<p class="font-bold">Bridge Status</p>
			<div class="form-control mt-3">
				<select
					class="select select-bordered select-secondary bg-transparent p-1 font-mono"
					bind:value={selectedOverlay}>
					{#each getOverlayOptions() as overlay}
						<option value={overlay}>
							{overlay}
						</option>
					{/each}
				</select>
			</div>
		</div>
	{/if}

	<!-- Destination Type Menu -->
	<div>
		<p class="font-bold">
			{#if selectedCategory === 'Travel Time' || selectedCategory === 'Impact'}
				Destination Type
			{:else if selectedCategory === 'Demographics'}
				Demographic Data
			{:else if selectedCategory === 'Population'}
				Population Data
			{/if}
		</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={selectedDestination}>
				{#each getDestinationOptions() as destination}
					<option value={destination}>
						{destination}
					</option>
				{/each}
			</select>
		</div>
	</div>
</div>
