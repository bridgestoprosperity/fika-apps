<script>
	import ImpactMap from './ImpactMap.svelte';
	import ImpactMapControls from './ImpactMapControls.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';

</script>

<svelte:head>
	<title>Impact Map</title>
	<meta
		name="description"
		content="An application to explore waterways data created with Waternet" />
	<meta property="og:image" content="https://apps.fikamap.com/waternet-magma-5.png" />
	<meta name="twitter:image" content="https://apps.fikamap.com/waternet-magma-5.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="726" />
</svelte:head>

<div class="relative h-screen w-full overflow-hidden">
	<!-- Map container -->
	<div class="absolute inset-0">
		<ImpactMap />
	</div>

	<div class="absolute left-16 top-[150px] z-40">
		<ControlPanel>
			<ImpactMapControls />
		</ControlPanel>
	</div>

	<!-- example of how i could add custom items to sideNav -->
	<!-- <SideNav items={saiNavItems}/> -->
	<SideNav />
</div>
