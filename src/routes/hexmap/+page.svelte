<script>
	import HexMap from './HexMap.svelte';
	import HexMapControls from './HexMapControls.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
</script>

<svelte:head>
	<title>Hex Data Explorer</title>
	<meta
		name="description"
		content="An application to explore hexagonal grid data and analytics" />
	<meta property="og:image" content="https://apps.fikamap.com/waternet-magma-5.png" />
	<meta name="twitter:image" content="https://apps.fikamap.com/waternet-magma-5.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="726" />
</svelte:head>

<div class="relative h-screen w-full overflow-hidden">
	<!-- Map container -->
	<div class="absolute inset-0">
		<HexMap />
	</div>

	<div class="absolute left-16 top-[150px] z-40">
		<ControlPanel>
			<HexMapControls />
		</ControlPanel>
	</div>

	<SideNav />
</div>