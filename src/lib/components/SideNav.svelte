<script>
	import { onMount } from 'svelte';
	import { SlidersSolid, MapSolid, HouseSolid, CircleInfoSolid } from 'svelte-awesome-icons';
	import b2pLogo from '$lib/images/b2plogo.png';
	import { waternetMapState } from '$lib/utils/state.svelte';

	function toggleControlPanel() {
		waternetMapState.visibility.controlPanelOpen = !waternetMapState.visibility.controlPanelOpen;
		document.querySelector('.panel-container').classList.toggle('closed');
	}
</script>

<aside class="fixed left-0 top-0 z-50 h-screen w-16 bg-white/30 backdrop-blur-sm">
	<div class="relative h-full">
		<!-- Logo Section -->
		<div class="flex h-20 items-center justify-center border-b border-gray-700/30">
			<a
				href="https://bridgestoprosperity.org"
				target="_blank"
				class="flex items-center justify-center">
				<img src={b2pLogo} alt="B2P Logo" class="h-10 w-10 transition-transform hover:scale-110" />
			</a>
		</div>

		<nav class="mt-6 flex flex-col items-center gap-4">
			<button
				class="group relative flex h-12 w-12 items-center justify-center rounded-xl text-secondary transition-all hover:scale-110"
				onclick={() => {
					window.location.href = '/';
				}}>
				<HouseSolid class="h-6 w-6" />
				<span
					class="absolute left-full ml-4 hidden rounded-md bg-gray-900 px-2 py-1 text-sm text-white group-hover:block">
					Home
				</span>
			</button>
			
			<!-- should use slot to add everything here so i can reuse component -->

			<button
				class="group relative flex h-12 w-12 items-center justify-center text-secondary transition-all hover:scale-110
                       {waternetMapState.visibility.controlPanelOpen ? 'bg-green-foggy rounded-xl' : ''}"
				onclick={toggleControlPanel}>
				<SlidersSolid class="h-6 w-6" />
				<span
					class="absolute left-full ml-4 hidden rounded-md bg-gray-900 px-2 py-1 text-sm text-white group-hover:block">
					Controls
				</span>
			</button>
			<button
				class="group relative flex h-12 w-12 items-center justify-center text-secondary transition-all hover:scale-110">
				<CircleInfoSolid class="h-6 w-6" />
				<span
					class="absolute left-full ml-4 hidden rounded-md bg-gray-900 px-2 py-1 text-sm text-white group-hover:block">
					Info
				</span>
			</button>

			<!-- Commented out info button preserved -->
			<!-- <button
                class="group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all hover:scale-110 text-primary"
                onclick={() => (activeItem = 'info')}>
                <CircleInfoSolid class="h-6 w-6" />
                <span
                    class="absolute left-full ml-4 hidden rounded-md bg-gray-900 px-2 py-1 text-sm text-white group-hover:block">
                    Info
                </span>
            </button> -->
		</nav>
	</div>
</aside>

<style>
	.bg-green-foggy {
		backdrop-filter: blur(10px);
		background: radial-gradient(circle, rgba(0, 181, 112, 0.346) 0%, rgba(0, 181, 112, 0) 100%);
	}
</style>
