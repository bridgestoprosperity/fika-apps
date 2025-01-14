<script>
	import SAIMap from '$lib/components/SAIMap.svelte';
	import SAIMapControls from '$lib/components/SAIMapControls.svelte';
	import SideNav from '$lib/components/SideNav.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';

	// Example of how i can use sidenav component
	// const saiNavItems = [
	//     {
	//         icon: MapSolid,
	//         label: 'Toggle Satellite',
	//         action: () => {
	//             saiMapState.visibility.satelliteImagery = !saiMapState.visibility.satelliteImagery;
	//         },
	//         isActive: () => saiMapState.visibility.satelliteImagery
	//     },
	//     {
	//         icon: ChartSimpleSolid,
	//         label: 'Analytics',
	//         action: () => {
	//             // Add your analytics action here
	//             console.log('Analytics clicked');
	//         }
	//     },
	//     {
	//         icon: TableCellsSolid,
	//         label: 'Data Table',
	//         action: () => {
	//             // Add your data table action here
	//             console.log('Data Table clicked');
	//         }
	//     }
	// ];
</script>

<svelte:head>
	<title>Safe Access Index Explorer</title>
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
		<SAIMap />
	</div>

	<div class="absolute left-16 top-[150px] z-40">
		<ControlPanel>
			<SAIMapControls />
		</ControlPanel>
	</div>

	<!-- example of how i could add custom items to sideNav -->
	<!-- <SideNav items={saiNavItems}/> -->
	<SideNav />
</div>
