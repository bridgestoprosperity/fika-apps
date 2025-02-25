<script>
	import WaternetMap from './WaternetMap.svelte';
    import ControlPanel from '$lib/components/ControlPanel.svelte';
	import WaternetMapControls from './WaternetMapControls.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
</script>

<svelte:head>
	<title>Waternet Explorer</title>
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
		<WaternetMap />
	</div>

	<!-- Controls -->
	<div class="absolute left-16 top-[150px] z-40">
		<ControlPanel>
			<WaternetMapControls />
		</ControlPanel>
	</div>

	<!-- Sidenav -->
	<SideNav />
</div>
