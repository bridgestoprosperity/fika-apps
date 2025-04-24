<script>
	import { impactMapState } from '$lib/utils/state.svelte.js';
	import { palettes } from '$lib/utils/colorPalettes';
	import { impactDataMap } from '$lib/utils/impactDataMap';
	import ColorPaletteBar from '$lib/components/ColorPaletteBar.svelte';

	// Use $state for reactive component state
	let selectedCategory = $state(getInitialCategory());
	let selectedOverlay = $state("");
	let selectedDestinationType = $state("");

	// Create reactive collections using $derived
	let categories = $derived(getCategoriesArray());
	let overlayOptions = $derived(getOverlayOptions(selectedCategory));
	let destinationTypeOptions = $derived(getDestinationTypeOptions());
	
	// Derived controls state
	let showDestinationType = $derived(
		selectedCategory === 'Travel Time' || selectedCategory === 'Impact'
	);
	let overlayDisabled = $derived(selectedCategory === 'Impact');
	
	// Track the previous values to detect changes
	let previousCategory = $state(selectedCategory);
	let previousOverlayOptions = $state([]);
	let previousDestinationTypeOptions = $state([]);
	
	// When category or options change, ensure we have valid selections
	$effect(() => {
		const categoryChanged = selectedCategory !== previousCategory;
		const overlayOptionsChanged = JSON.stringify(overlayOptions) !== JSON.stringify(previousOverlayOptions);
		const destOptionsChanged = JSON.stringify(destinationTypeOptions) !== JSON.stringify(previousDestinationTypeOptions);
		
		// Update tracking variables
		if (categoryChanged) {
			previousCategory = selectedCategory;
		}
		
		if (overlayOptionsChanged) {
			previousOverlayOptions = [...overlayOptions];
		}
		
		if (destOptionsChanged) {
			previousDestinationTypeOptions = [...destinationTypeOptions];
		}
		
		// Handle category changes (always reset submenus)
		if (categoryChanged) {
			// Reset overlay when appropriate
			if (overlayOptions.length > 0 && !overlayDisabled) {
				selectedOverlay = overlayOptions[0];
			}
			
			// Reset destination type when appropriate
			if (showDestinationType && destinationTypeOptions.length > 0) {
				selectedDestinationType = destinationTypeOptions[0];
			}
		}
		// Handle options changing while category stays the same
		else {
			// If overlay options changed and current selection is invalid
			if (overlayOptionsChanged && !overlayOptions.includes(selectedOverlay) && !overlayDisabled) {
				selectedOverlay = overlayOptions.length > 0 ? overlayOptions[0] : "";
			}
			
			// If destination type options changed and current selection is invalid
			if (destOptionsChanged && !destinationTypeOptions.includes(selectedDestinationType) && showDestinationType) {
				selectedDestinationType = destinationTypeOptions.length > 0 ? destinationTypeOptions[0] : "";
			}
		}
		
		// Update visualization if anything changed
		if (categoryChanged || overlayOptionsChanged || destOptionsChanged) {
			// Ensure the updateDataName is called after setting new values
			setTimeout(() => updateDataName(), 0);
		}
	});

	
	// Initialize dataMapKey if it's empty but we have a menuState
	$effect(() => {
		if (!impactMapState.dataMapKey && impactMapState.menuState) {
			// Find the matching key based on menuState
			for (const key in impactDataMap) {
				if (impactDataMap[key].meta_info.name === impactMapState.menuState) {
					impactMapState.dataMapKey = key;
					break;
				}
			}
		}
	});


	// Initialize values
	$effect(() => {
		// Set initial overlay if options exist, preferring to match current menuState
		if (overlayOptions.length > 0 && !selectedOverlay) {
			let found = false;
			
			// Try to find overlay matching current menuState
			if (impactMapState.menuState && !showDestinationType) {
				const matchingOverlay = overlayOptions.find(overlay => overlay === impactMapState.menuState);
				if (matchingOverlay) {
					selectedOverlay = matchingOverlay;
					found = true;
				}
			}
			
			// Fallback to first option if no match found
			if (!found) {
				selectedOverlay = overlayOptions[0];
			}
		}
		
		// Set initial destination type if applicable, preferring to match current menuState
		if (showDestinationType && !selectedDestinationType) {
			let found = false;
			
			// Try to find destination type matching current menuState
			if (impactMapState.menuState) {
				const matchingDestType = destinationTypeOptions.find(dest => dest === impactMapState.menuState);
				if (matchingDestType) {
					selectedDestinationType = matchingDestType;
					found = true;
				}
			}
			
			// Fallback to first option if no match found
			if (!found && destinationTypeOptions.length > 0) {
				selectedDestinationType = destinationTypeOptions[0];
			}
		}

		// Update the visualization whenever selections change
		updateDataName();
	});

	// Helper function to get initial category based on impactMapState.menuState
	function getInitialCategory() {
		// First try to find category based on menuState
		if (impactMapState.menuState) {
			for (const key in impactDataMap) {
				if (impactDataMap[key].meta_info.name === impactMapState.menuState) {
					return impactDataMap[key].meta_info.category;
				}
			}
		}
		
		// Fallback to first available category
		const categories = new Set();
		for (const key in impactDataMap) {
			categories.add(impactDataMap[key].meta_info.category);
		}
		return Array.from(categories)[0] || "";
	}

	// Helper function to get all categories
	function getCategoriesArray() {
		const categories = new Set();
		for (const key in impactDataMap) {
			categories.add(impactDataMap[key].meta_info.category);
		}
		return Array.from(categories);
	}

	// Helper function to get overlay options based on selected category
	function getOverlayOptions(category) {
		const options = new Set();
		
		if (category === 'Travel Time') {
			return ['with bridges', 'without bridges'];
		}
		
		for (const key in impactDataMap) {
			if (impactDataMap[key].meta_info.category === category) {
				if (category === 'Population' || category === 'Demographics') {
					options.add(impactDataMap[key].meta_info.name);
				}
			}
		}
		
		return Array.from(options);
	}

	// Helper function to get destination type options
	function getDestinationTypeOptions() {
		const options = new Set();
		
		if (selectedCategory === 'Travel Time' || selectedCategory === 'Impact') {
			for (const key in impactDataMap) {
				if (impactDataMap[key].meta_info.category === selectedCategory) {
					options.add(impactDataMap[key].meta_info.name);
				}
			}
		}
		
		return Array.from(options);
	}

	// Function to update the selected visualization in impactMapState
	function updateDataName() {
		// Find the matching visualization key from impactDataMap
		for (const key in impactDataMap) {
			const data = impactDataMap[key];
			
			if (data.meta_info.category === selectedCategory) {
				if (selectedCategory === 'Impact' || selectedCategory === 'Travel Time') {
					// For Impact and Travel Time, match by destination type
					if (data.meta_info.name === selectedDestinationType) {
						impactMapState.dataName = data.meta_info.data_name;
						impactMapState.menuState = data.meta_info.name;
						impactMapState.dataMapKey = key; // Store the key
						break;
					}
				} else {
					// For Population and Demographics, match by overlay name
					if (data.meta_info.name === selectedOverlay) {
						impactMapState.dataName = data.meta_info.data_name;
						impactMapState.menuState = data.meta_info.name;
						impactMapState.dataMapKey = key; // Store the key
						break;
					}
				}
			}
		}
	}
</script>

<div class="space-y-4">
	<!-- Data Overlay Category Menu -->
	<div>
		<p class="font-bold">Data Overlay Category</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={selectedCategory}>
				{#each categories as category}
					<option value={category}>
						{category}
					</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Data Overlay Details Menu -->
	<div>
		<p class="font-bold">Data Overlay Details</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				bind:value={selectedOverlay}
				disabled={overlayDisabled}>
				{#each overlayOptions as overlay}
					<option value={overlay}>
						{overlay}
					</option>
				{/each}
				{#if overlayOptions.length === 0}
					<option value="" disabled>No options available</option>
				{/if}
			</select>
		</div>
	</div>

	<!-- Destination Type Menu (conditionally displayed) -->
	{#if showDestinationType}
		<div>
			<p class="font-bold">Destination Type</p>
			<div class="form-control mt-3">
				<select
					class="select select-bordered select-secondary bg-transparent p-1 font-mono"
					bind:value={selectedDestinationType}>
					{#each destinationTypeOptions as destinationType}
						<option value={destinationType}>
							{destinationType}
						</option>
					{/each}
					{#if destinationTypeOptions.length === 0}
						<option value="" disabled>No options available</option>
					{/if}
				</select>
			</div>
		</div>
	{/if}
</div>