<script>
	import { XmarkSolid } from 'svelte-awesome-icons';
	import { zambiaMapState } from '$lib/utils/state.svelte.js';

	/**
	 * Parse PostgreSQL array format "{val1,val2}" and return count.
	 */
	function countPgArray(str) {
		if (!str || typeof str !== 'string') return 0;
		const cleaned = str.replace(/[{}]/g, '').trim();
		if (!cleaned) return 0;
		return cleaned.split(',').length;
	}

	function formatMinutes(val) {
		if (val == null || val === 0) return 'N/A';
		const num = Number(val);
		if (isNaN(num)) return val;
		if (num < 60) return `${num} min`;
		const hours = Math.floor(num / 60);
		const mins = num % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	let props = $derived(() => {
		const type = zambiaMapState.clickedFeatureType;
		if (type === 'hex') return zambiaMapState.selectedHexData?.properties;
		if (type === 'bridge') return zambiaMapState.selectedBridgeData?.properties;
		if (type === 'destination') return zambiaMapState.selectedDestinationData?.properties;
		return null;
	});
</script>

{#if zambiaMapState.filterMode && props()}
	<div class="info-card">
		<div class="mb-2 flex items-start justify-between">
			<h3 class="font-bold text-secondary">
				{#if zambiaMapState.clickedFeatureType === 'hex'}
					Hex Area
				{:else if zambiaMapState.clickedFeatureType === 'bridge'}
					Bridge Site
				{:else if zambiaMapState.clickedFeatureType === 'destination'}
					{props().name || 'Destination'}
				{/if}
			</h3>
			<button
				onclick={() => {
					// Reset will be triggered by clicking empty area on map,
					// but we also provide this close button
					zambiaMapState.filterMode = false;
					zambiaMapState.clickedFeatureType = null;
					zambiaMapState.selectedHexData = null;
					zambiaMapState.selectedBridgeData = null;
					zambiaMapState.selectedDestinationData = null;
					zambiaMapState.highlightedBridges = [];
					zambiaMapState.highlightedDestinations = [];
					zambiaMapState.highlightedHexes = [];
					zambiaMapState.pathsVisible = false;
				}}
				class="ml-2 p-1 text-gray-500 hover:text-gray-800"
				aria-label="Close info card">
				<XmarkSolid size="14" />
			</button>
		</div>

		<div class="space-y-1 text-sm">
			{#if zambiaMapState.clickedFeatureType === 'hex'}
				<p><span class="font-semibold">Population:</span> {props().population}</p>
				<p><span class="font-semibold">RWI:</span> {Number(props().rwi).toFixed(3)}</p>
				<p>
					<span class="font-semibold">Health Travel:</span>
					{formatMinutes(props().travel_time_health_centers)}
				</p>
				<p>
					<span class="font-semibold">Education Travel:</span>
					{formatMinutes(props().travel_time_all_education)}
				</p>
				<p>
					<span class="font-semibold">Health Destinations:</span>
					{countPgArray(props().health_destinations)}
				</p>
				<p>
					<span class="font-semibold">Edu Destinations:</span>
					{countPgArray(props().edu_destinations)}
				</p>
			{:else if zambiaMapState.clickedFeatureType === 'bridge'}
				<p>
					<span class="font-semibold">Type:</span>
					{props().type?.replace('_', ' ')}
				</p>
				<p>
					<span class="font-semibold">Bridge Index:</span>
					{props().bridge_index}
				</p>
				<p>
					<span class="font-semibold">Health Destinations:</span>
					{countPgArray(props().health_destinations)}
				</p>
				<p>
					<span class="font-semibold">Edu Destinations:</span>
					{countPgArray(props().edu_destinations)}
				</p>
			{:else if zambiaMapState.clickedFeatureType === 'destination'}
				<p>
					<span class="font-semibold">Category:</span>
					{props().category}
				</p>
				<p>
					<span class="font-semibold">Hexes Served:</span>
					{countPgArray(props().h3_indices)}
				</p>
				<p>
					<span class="font-semibold">Bridges Used:</span>
					{countPgArray(props().bridges_used)}
				</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.info-card {
		position: absolute;
		top: 20px;
		right: 20px;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		padding: 16px;
		max-width: 280px;
		min-width: 200px;
		z-index: 50;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
</style>
