<script>
	import ZambiaMap from '$lib/components/zambiademo/ZambiaMap.svelte';
	import ZambiaMapControls from '$lib/components/zambiademo/ZambiaMapControls.svelte';
	import InfoCard from '$lib/components/zambiademo/InfoCard.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
</script>

<svelte:head>
	<title>Zambia Demo - Itezhi-Tezhi</title>
	<meta
		name="description"
		content="Interactive map showing bridge impact analysis in Zambia's Itezhi-Tezhi region" />
</svelte:head>

<div class="relative h-screen w-full overflow-hidden">
	<div class="absolute inset-0">
		<ZambiaMap />
	</div>

	<div class="absolute left-16 top-[150px] z-40">
		<ControlPanel>
			<ZambiaMapControls />
		</ControlPanel>
	</div>

	<InfoCard />

	<SideNav />
</div>
