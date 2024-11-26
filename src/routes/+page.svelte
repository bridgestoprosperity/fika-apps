<script>
	import waterwaysMagma from '$lib/images/waternet-magma-4.jpg';
	import waterwaysBlue from '$lib/images/waternet-blue-1.png';
	import waterwaysVector from '$lib/images/waternet-kenya.png';
	import { onMount } from 'svelte';
	import DownArrow from 'virtual:icons/line-md/arrow-down-circle';

	let isLoaded = false;
	let baseFrequency = 3;

	onMount(() => {
		isLoaded = true;

		// Start the animation loop
		const animate = () => {
			// Create a smooth oscillation between 3 and 3.5
			baseFrequency = 3 + (Math.sin(Date.now() / 4000) * 0.25 + 0.25);
			requestAnimationFrame(animate);
		};

		animate();
	});
</script>

<header>
	<div class="relative h-[calc(100vh-4rem)] overflow-hidden">
		<!-- Base background image with Ken Burns effect -->
		<div
			class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[15s] ease-out"
			class:scale-125={isLoaded}
			style="background-image: url({waterwaysMagma}); transform-origin: bottom center;"
		></div>

		<!-- Noise overlay -->
		<div class="absolute inset-0">
			<svg
				class="h-full w-full opacity-50"
				viewBox="0 0 256 256"
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="xMidYMid slice"
			>
				<filter id="noiseFilter">
					<feTurbulence type="fractalNoise" {baseFrequency} numOctaves="1" stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#noiseFilter)"></rect>
			</svg>
		</div>

		<!-- Dark overlay for better text contrast -->
		<div class="absolute inset-0 bg-black/30"></div>

		<!-- Content -->
		<div class="relative flex h-full items-center justify-center">
			<div class="text-center">
				<h1 class="fade-in mb-5 text-8xl font-bold text-white">Fika Apps</h1>
				<p class="fade-in mb-5 text-4xl text-white delay-500">
					Check out Fika Maps latest digital apps and experiments below.
				</p>
				<DownArrow class="link mx-auto h-[60px] w-[60px] text-white" />
			</div>
		</div>
	</div>
</header>
<br />
<br />

<!-- add three columns of cards -->
<div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img
				src={waterwaysBlue}
				alt="Shoes"
			/>
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Raster App</h2>
			<p>An application allowing you to explore the waterways data in raster form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img
				src={waterwaysMagma}
				alt="Shoes"
			/>
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Raster App</h2>
			<p>An application allowing you to explore the waterways data in raster form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img
				src={waterwaysVector}
				alt="Shoes"
			/>
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Vector App</h2>
			<p>An application allowing you to explore the waterways data in vector form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img
				src={waterwaysMagma}
				alt="Shoes"
			/>
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Raster App</h2>
			<p>An application allowing you to explore the waterways data in raster form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>
	<div class="card card-compact w-96 bg-base-100 shadow-xl">
		<figure>
			<img
				src={waterwaysBlue}
				alt="Shoes"
			/>
		</figure>
		<div class="card-body">
			<h2 class="card-title">Waterways Raster App</h2>
			<p>An application allowing you to explore the waterways data in raster form</p>
			<div class="card-actions justify-end"></div>
		</div>
	</div>

</div>

<style>
	.fade-in {
		opacity: 0;
		animation: fadeIn 1s ease-out forwards;
	}

	.delay-500 {
		animation-delay: 500ms;
	}

	.delay-1000 {
		animation-delay: 1000ms;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
