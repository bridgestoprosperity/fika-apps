<script>
	import { impactMapState } from '$lib/utils/state.svelte.js';
	import { impactDataMap } from '$lib/utils/impactDataMap';
	import { onMount } from 'svelte';

	// Simple state variables
	let selectedCategory = $state('Travel Time');
	let selectedOverlay = $state('with bridges');
	let selectedDestinationType = $state('All Education');

	// Computed properties (non-reactive for simplicity)
	function getCategories() {
		const categories = new Set();
		for (const key in impactDataMap) {
			categories.add(impactDataMap[key].meta_info.category);
		}
		return Array.from(categories);
	}

	function getOverlayOptions() {
		const options = new Set();
		
		if (selectedCategory === 'Travel Time') {
			return ['with bridges', 'without bridges'];
		}
		
		for (const key in impactDataMap) {
			if (impactDataMap[key].meta_info.category === selectedCategory) {
				if (selectedCategory === 'Population' || selectedCategory === 'Demographics') {
					options.add(impactDataMap[key].meta_info.name);
				}
			}
		}
		
		return Array.from(options);
	}

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

	// UI-derived properties
	function getShowDestinationType() {
		return selectedCategory === 'Travel Time' || selectedCategory === 'Impact';
	}

	function getOverlayDisabled() {
		return selectedCategory === 'Impact';
	}

	// Initialize the component
	function initializeComponent() {
		// Set category first
		let initialCategory = '';
		
		if (impactMapState.dataMapKey && impactDataMap[impactMapState.dataMapKey]) {
			initialCategory = impactDataMap[impactMapState.dataMapKey].meta_info.category;
		} else {
			initialCategory = getCategories()[0] || '';
		}
		
		selectedCategory = initialCategory;
		console.log('Initial category:', selectedCategory);
		
		// Set submenus based on the category
		if (selectedCategory) {
			// For Travel Time or Impact, set destination type
			if (selectedCategory === 'Travel Time' || selectedCategory === 'Impact') {
				const options = getDestinationTypeOptions();
				if (options.length > 0) {
					selectedDestinationType = options[0];
				}
			} 
			// For other categories, set overlay
			else {
				const options = getOverlayOptions();
				if (options.length > 0) {
					selectedOverlay = options[0];
				}
			}
		}
		
		console.log('Initial values:', {
			category: selectedCategory,
			overlay: selectedOverlay,
			destinationType: selectedDestinationType
		});
		
		// Update the map state
		updateMapState();
	}

	// Function to update the map state
	function updateMapState() {
		console.log('Updating map state with:', {
			category: selectedCategory,
			overlay: selectedOverlay,
			destinationType: selectedDestinationType
		});
		
		// Find the matching key in impactDataMap
		for (const key in impactDataMap) {
			const data = impactDataMap[key];
			
			// Match by category and name
			if (data.meta_info.category === selectedCategory) {
				// For Travel Time or Impact, match by destination type
				if (selectedCategory === 'Travel Time' || selectedCategory === 'Impact') {
					if (data.meta_info.name === selectedDestinationType) {
						// We found a match - update the state
						console.log('Found matching data:', key, data.meta_info.name);
						impactMapState.dataMapKey = key;
						impactMapState.dataName = data.meta_info.data_name;
						impactMapState.menuState = data.meta_info.name;
						return; // Exit after finding a match
					}
				} 
				// For other categories, match by overlay
				else {
					if (data.meta_info.name === selectedOverlay) {
						// We found a match - update the state
						console.log('Found matching data:', key, data.meta_info.name);
						impactMapState.dataMapKey = key;
						impactMapState.dataName = data.meta_info.data_name;
						impactMapState.menuState = data.meta_info.name;
						return; // Exit after finding a match
					}
				}
			}
		}
		
		console.warn('No matching data found for the current selection');
	}
	
	// Event handlers
	function handleCategoryChange(event) {
		const newCategory = event.target.value;
		console.log('Category changed to:', newCategory);
		
		// Update category
		selectedCategory = newCategory;
		
		// Reset submenus
		if (getShowDestinationType()) {
			const options = getDestinationTypeOptions();
			selectedDestinationType = options.length > 0 ? options[0] : '';
			selectedOverlay = '';
		} else {
			const options = getOverlayOptions();
			selectedOverlay = options.length > 0 ? options[0] : '';
			selectedDestinationType = '';
		}
		
		// Update map state
		updateMapState();
	}
	
	function handleOverlayChange(event) {
		selectedOverlay = event.target.value;
		console.log('Overlay changed to:', selectedOverlay);
		updateMapState();
	}
	
	function handleDestinationTypeChange(event) {
		selectedDestinationType = event.target.value;
		console.log('Destination type changed to:', selectedDestinationType);
		updateMapState();
	}
	
	// Run initialization on mount
	onMount(initializeComponent);
</script>

<div class="space-y-4">
	<!-- Data Overlay Category Menu -->
	<div>
		<p class="font-bold">Data Overlay Category</p>
		<div class="form-control mt-3">
			<select
				class="select select-bordered select-secondary bg-transparent p-1 font-mono"
				value={selectedCategory}
				on:change={handleCategoryChange}>
				{#each getCategories() as category}
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
				value={selectedOverlay}
				on:change={handleOverlayChange}
				disabled={getOverlayDisabled()}>
				{#each getOverlayOptions() as overlay}
					<option value={overlay}>
						{overlay}
					</option>
				{/each}
				{#if getOverlayOptions().length === 0}
					<option value="" disabled>No options available</option>
				{/if}
			</select>
		</div>
	</div>

	<!-- Destination Type Menu (conditionally displayed) -->
	{#if getShowDestinationType()}
		<div>
			<p class="font-bold">Destination Type</p>
			<div class="form-control mt-3">
				<select
					class="select select-bordered select-secondary bg-transparent p-1 font-mono"
					value={selectedDestinationType}
					on:change={handleDestinationTypeChange}>
					{#each getDestinationTypeOptions() as destinationType}
						<option value={destinationType}>
							{destinationType}
						</option>
					{/each}
					{#if getDestinationTypeOptions().length === 0}
						<option value="" disabled>No options available</option>
					{/if}
				</select>
			</div>
		</div>
	{/if}
</div>