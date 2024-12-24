<script>
    import WaternetMap from '$lib/components/WaternetMap.svelte';
    import MapControls from '$lib/components/MapControls.svelte';
    import SideNav from '$lib/components/SideNav.svelte';
</script>

<div class="relative h-screen w-full overflow-hidden">
    <!-- Map container -->
    <div class="absolute inset-0">
        <WaternetMap />
    </div>
    
    <!-- Controls -->
    <MapControls />
    
    <!-- Sidenav -->
    <SideNav />
</div>