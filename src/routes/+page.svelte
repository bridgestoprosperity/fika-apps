<script>
	import { onMount } from 'svelte';
	import tdxhydroEthiopia from '$lib/images/tdxhydro-ethiopia.png';
	import tdxhydroKenya from '$lib/images/tdxhydro-kenya.png';
	import watenetMagma7 from '$lib/images/watenet-magma-7.png';
	import waternetBlue1 from '$lib/images/waternet-blue-1.png';
	import waternetEthiopia from '$lib/images/waternet-ethiopia.png';
	import waternetKenya from '$lib/images/waternet-kenya.png';
	import waternetMagma1 from '$lib/images/waternet-magma-1.png';
	import waternetMagma2 from '$lib/images/waternet-magma-2.png';
	import waternetMagma3 from '$lib/images/waternet-magma-3.png';
	import waternetMagma4Jpg from '$lib/images/waternet-magma-4.jpg';
	import waternetMagma4Png from '$lib/images/waternet-magma-4.png';
	import waternetMagma5 from '$lib/images/waternet-magma-5.png';
	import waternetMagma6 from '$lib/images/waternet-magma-6.png';
	import waternetMagma8 from '$lib/images/waternet-magma-8.png';
	import waternetVectorEthiopia from '$lib/images/waternet-vector-ethiopia.png';
	import { CalendarCheckRegular } from 'svelte-awesome-icons';
	let isLoaded = false;

	onMount(() => {
		isLoaded = true;
	});
</script>

<!-- example of how to use icons-->
<!-- <CalendarCheckRegular class="w-12 h-12 text-primary-500" /> -->
<!-- <div class="col-start-1 row-start-1 md:col-start-1 md:row-start-1 md:col-span-2 md:row-span-1 bg-gray-300 rounded-md overflow-hidden">
	<img src={waternetMagma1} alt="Water Network 1" class="w-full h-full object-cover" />
</div> -->

<header>
	<div class="m-4 grid grid-cols-3 grid-rows-5 gap-2 md:grid-cols-5 md:grid-rows-4 md:gap-2">
		<!-- From top -->
		<div
			class="slide-from-top relative col-start-1 row-start-1 rounded-md bg-gray-300 p-10 md:col-span-2 md:col-start-1 md:row-span-1 md:row-start-1 shadow-lg">
			<img
				src={waternetMagma1}
				alt="Water Network 1"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">0</span>
		</div>
		<div
			class="slide-from-top animation-delay-100 relative col-span-2 col-start-2 row-span-2 row-start-1 rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-1 shadow-lg">
			<img
				src={waternetMagma2}
				alt="Water Network 2"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">1</span>
		</div>
		<div
			class="slide-from-top animation-delay-200 relative col-start-1 row-start-2 rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-4 md:row-span-2 md:row-start-1 shadow-lg">
			<img
				src={waternetMagma3}
				alt="Water Network 3"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">2</span>
		</div>
		<div
			class="slide-from-top animation-delay-300 relative col-span-2 col-start-1 row-start-3 rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-5 md:row-span-1 md:row-start-1 shadow-lg">
			<img
				src={waternetMagma4Png}
				alt="Water Network 4"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">3</span>
		</div>

		<!-- From right -->
		<div
			class="slide-from-right animation-delay-200 relative col-span-2 col-start-2 row-start-4 rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-5 md:row-span-1 md:row-start-2 shadow-lg">
			<img
				src={waternetMagma5}
				alt="Water Network 5"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">4</span>
		</div>
		<div
			class="slide-from-right animation-delay-300 relative hidden rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-5 md:row-span-2 md:row-start-3 md:block shadow-lg">
			<img
				src={tdxhydroEthiopia}
				alt="TDX Hydro Ethiopia"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">10</span>
		</div>

		<!-- From left -->
		<div
			class="slide-from-left relative col-start-2 row-start-5 rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-1 md:row-span-1 md:row-start-2 shadow-lg">
			<img
				src={waternetMagma6}
				alt="Water Network 6"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">5</span>
		</div>
		<div
			class="slide-from-left animation-delay-100 relative col-start-1 row-span-2 row-start-4 rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-1 md:row-span-2 md:row-start-3 shadow-lg">
			<img
				src={waternetMagma8}
				alt="Water Network 8"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">7</span>
		</div>

		<!-- From bottom -->
		<div
			class="slide-from-bottom relative col-start-3 row-start-3 rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-3 shadow-lg">
			<img
				src={waternetEthiopia}
				alt="Water Network Ethiopia"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">8</span>
		</div>
		<div
			class="slide-from-bottom animation-delay-200 relative hidden rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-4 md:block shadow-lg">
			<img
				src={tdxhydroKenya}
				alt="TDX Hydro Kenya"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">11</span>
		</div>
		<div
			class="slide-from-bottom animation-delay-300 relative hidden rounded-md bg-gray-300 p-10 md:col-span-1 md:col-start-4 md:row-span-1 md:row-start-4 md:block shadow-lg">
			<img
				src={waternetBlue1}
				alt="Water Network Blue"
				class="absolute inset-0 h-full w-full rounded-md object-cover" />
			<span class="relative z-10">12</span>
		</div>

		<!-- Remaining items without animation -->
		<div
			class="relative col-start-3 row-start-5 rounded-md md:col-span-2 md:col-start-2 md:row-span-1 md:row-start-2">
			<span class="title-text relative z-10">Fika</span>
		</div>
		<div
			class="relative hidden rounded-md md:col-span-2 md:col-start-3 md:row-span-1 md:row-start-3 md:block">
			<span class="title-text relative z-10">Apps</span>
		</div>
	</div>
</header>
<br />
<br />

<!-- add three columns of cards -->
<div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img src={waternetMagma6} alt="Shoes" />
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Raster App</h2>
			<p>An application allowing you to explore the waterways data in raster form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img src={waternetKenya} alt="Shoes" />
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Raster App</h2>
			<p>An application allowing you to explore the waterways data in raster form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img src={waternetBlue1} alt="Shoes" />
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Vector App</h2>
			<p>An application allowing you to explore the waterways data in vector form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img src={waternetMagma3} alt="Shoes" />
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Raster App</h2>
			<p>An application allowing you to explore the waterways data in raster form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img src={waternetVectorEthiopia} alt="Shoes" />
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Raster App</h2>
			<p>An application allowing you to explore the waterways data in raster form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
</div>

<style>
	.slide-from-top {
		animation: slideFromTop 3s ease-out forwards;
		opacity: 0;
	}

	.slide-from-right {
		animation: slideFromRight 3s ease-out forwards;
		opacity: 0;
	}

	.slide-from-bottom {
		animation: slideFromBottom 3s ease-out forwards;
		opacity: 0;
	}

	.slide-from-left {
		animation: slideFromLeft 3s ease-out forwards;
		opacity: 0;
	}

	.animation-delay-100 {
		animation-delay: 100ms;
	}

	.animation-delay-200 {
		animation-delay: 200ms;
	}

	.animation-delay-300 {
		animation-delay: 300ms;
	}
	.title-text {
		font-size: 6rem;
		font-weight: 700;
	}

	@keyframes slideFromTop {
		from {
			transform: translateY(-1000px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes slideFromRight {
		from {
			transform: translateX(1000px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideFromBottom {
		from {
			transform: translateY(1000px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes slideFromLeft {
		from {
			transform: translateX(-1000px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
