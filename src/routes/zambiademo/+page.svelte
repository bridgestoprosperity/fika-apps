<script>
	import ZambiaMap from '$lib/components/zambiademo/ZambiaMap.svelte';
	import ZambiaMapControls from '$lib/components/zambiademo/ZambiaMapControls.svelte';
	import ZambiaDataPanel from '$lib/components/zambiademo/ZambiaDataPanel.svelte';
	import ZambiaWalkthrough from '$lib/components/zambiademo/ZambiaWalkthrough.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	import { zambiaMapState } from '$lib/utils/state.svelte.js';
	import { PlaySolid, GlobeSolid } from 'svelte-awesome-icons';
	import { goto } from '$app/navigation';

	let zambiaMapRef;

	function startWalkthrough() {
		zambiaMapState.walkthroughActive = true;
	}

	function goToImpactMap() {
		goto('/impactmap');
	}
</script>

<svelte:head>
	<title>Zambia Demo - Itezhi-Tezhi</title>
	<meta
		name="description"
		content="Interactive map showing bridge impact analysis in Zambia's Itezhi-Tezhi region" />
</svelte:head>

<div class="relative h-screen w-full overflow-hidden">
	<div class="absolute inset-0">
		<ZambiaMap bind:this={zambiaMapRef} />
	</div>

	<!-- Top Right Buttons -->
	{#if !zambiaMapState.walkthroughActive}
		<div class="top-right-buttons">
			<button onclick={goToImpactMap} class="nav-btn impact-map-btn">
				<GlobeSolid size="14" />
				<span>Multi-Country Impact Map</span>
			</button>
			<button onclick={startWalkthrough} class="nav-btn start-tour-btn">
				<PlaySolid size="14" />
				<span>Start Tour</span>
			</button>
		</div>
	{/if}

	<!-- Controls Panel (hidden during walkthrough) -->
	{#if !zambiaMapState.walkthroughActive}
		<div class="absolute left-16 top-[150px] z-40">
			<ControlPanel>
				<ZambiaMapControls />
			</ControlPanel>
		</div>
	{/if}

	<ZambiaDataPanel />

	<ZambiaWalkthrough getMapController={() => zambiaMapRef?.getMapController?.()} />

	<SideNav />
</div>

<style>
	.top-right-buttons {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 45;
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		backdrop-filter: blur(8px);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		font-family: 'Kumbh Sans', sans-serif;
		cursor: pointer;
		transition: all 0.2s;
	}

	.start-tour-btn {
		background: rgba(0, 145, 73, 0.95);
		box-shadow: 0 4px 12px rgba(0, 145, 73, 0.3);
	}

	.start-tour-btn:hover {
		background: rgba(0, 122, 61, 0.98);
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(0, 145, 73, 0.4);
	}

	.impact-map-btn {
		background: rgba(22, 19, 69, 0.95);
		box-shadow: 0 4px 12px rgba(22, 19, 69, 0.3);
	}

	.impact-map-btn:hover {
		background: rgba(30, 26, 94, 0.98);
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(22, 19, 69, 0.4);
	}

	.nav-btn:active {
		transform: translateY(0);
	}
</style>
