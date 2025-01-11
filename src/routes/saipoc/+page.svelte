<script>
    import SAIMap from '$lib/components/SAIMap.svelte';
    import MapControls from '$lib/components/MapControls.svelte';
    import SideNav from '$lib/components/SideNav.svelte';
</script>

<svelte:head>
    <title>Safe Access Index Explorer</title>
    <meta name="description" content="An application to explore waterways data created with Waternet" />
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
    
    <!-- Controls -->
    <!-- <MapControls /> -->
    
    <!-- Sidenav -->
    <SideNav />
</div>