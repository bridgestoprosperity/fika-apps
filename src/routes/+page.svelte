<script>
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import AppCard from '$lib/components/HomePageCard.svelte';
	import TiltCard from '$lib/components/TiltCard.svelte';

	// Import all images individually
	import tdxhydroEthiopia from '$lib/images/tdxhydro-ethiopia.png';
	import tdxhydroKenya from '$lib/images/tdxhydro-kenya.png';
	import watenetMagma7 from '$lib/images/watenet-magma-7.png';
	import waternetBlue1 from '$lib/images/waternet-blue-1.png';
	import waternetEthiopia from '$lib/images/waternet-ethiopia.png';
	import waternetKenya from '$lib/images/waternet-kenya.png';
	import waternetMagma1 from '$lib/images/waternet-magma-1.png';
	import waternetMagma2 from '$lib/images/waternet-magma-2.png';
	import waternetMagma3 from '$lib/images/waternet-magma-3.png';
	import waternetMagma4Png from '$lib/images/waternet-magma-4.png';
	import waternetMagma5 from '$lib/images/waternet-magma-5.png';
	import waternetMagma6 from '$lib/images/waternet-magma-6.png';
	import waternetMagma8 from '$lib/images/waternet-magma-8.png';
	import waternetVectorEthiopia from '$lib/images/waternet-vector-ethiopia.png';

	let isLoaded = $state(false);

	// Define grid items for better maintainability
	const gridItems = [
		{
			src: waternetMagma1,
			alt: 'Water Network 1',
			className:
				'slide-from-top col-span-2 col-start-1 row-start-1 md:col-span-2 md:col-start-1 md:row-start-1'
		},
		{
			src: waternetMagma2,
			alt: 'Water Network 2',
			className:
				'slide-from-top animation-delay-100 col-span-2 col-start-2 row-span-2 row-start-1 md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-1'
		},
		{
			src: waternetMagma3,
			alt: 'Water Network 3',
			className:
				'slide-from-top animation-delay-200 col-start-1 row-start-2 md:col-span-1 md:col-start-4 md:row-span-2 md:row-start-1'
		},
		{
			src: waternetMagma4Png,
			alt: 'Water Network 4',
			className:
				'slide-from-top animation-delay-300 col-span-2 col-start-1 row-start-3 md:col-span-1 md:col-start-5 md:row-span-1 md:row-start-1'
		},
		{
			src: waternetMagma5,
			alt: 'Water Network 5',
			className:
				'slide-from-right animation-delay-200 col-span-2 col-start-2 row-start-4 md:col-span-1 md:col-start-5 md:row-span-1 md:row-start-2'
		},
		{
			src: tdxhydroEthiopia,
			alt: 'TDX Hydro Ethiopia',
			className:
				'slide-from-right animation-delay-300 hidden md:col-span-1 md:col-start-5 md:row-span-2 md:row-start-3 md:block'
		},
		{
			src: waternetMagma6,
			alt: 'Water Network 6',
			className:
				'slide-from-left col-start-2 row-start-5 md:col-span-1 md:col-start-1 md:row-span-1 md:row-start-2'
		},
		{
			src: waternetMagma8,
			alt: 'Water Network 8',
			className:
				'slide-from-left animation-delay-100 col-start-1 row-span-2 row-start-4 md:col-span-1 md:col-start-1 md:row-span-2 md:row-start-3'
		},
		{
			src: waternetEthiopia,
			alt: 'Water Network Ethiopia',
			className:
				'slide-from-bottom col-start-3 row-start-3 md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-3'
		},
		{
			src: tdxhydroKenya,
			alt: 'TDX Hydro Kenya',
			className:
				'slide-from-bottom animation-delay-200 hidden md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-4 md:block'
		},
		{
			src: waternetBlue1,
			alt: 'Water Network Blue',
			className:
				'slide-from-bottom animation-delay-300 hidden md:col-span-1 md:col-start-4 md:row-span-1 md:row-start-4 md:block'
		}
	];

	const appCards = [
		{
			image: waternetVectorEthiopia,
			alt: 'map of ethiopia',
			title: 'Waterways Data Explorer App',
			description: 'An application allowing you to explore the waterways data',
			href: '/waternet'
		}
	];

	$effect(() => {
		isLoaded = true;
	});
</script>

<div class="flex min-h-screen flex-col">
	<header class="flex flex-col">
		<TopNav />
		<div
			class="calc-grid grid grid-cols-3 grid-rows-5 gap-2 md:grid-cols-5 md:grid-rows-4 md:gap-2">
			{#each gridItems as item}
				<div class={item.className}>
					<TiltCard src={item.src} alt={item.alt} className="w-full h-full object-cover">
						<span class="relative z-10" />
					</TiltCard>
				</div>
			{/each}

			<div
				class="fika-slide flex items-end justify-end rounded-md text-right md:col-span-2 md:col-start-2 md:row-span-1 md:row-start-2">
				<span class="title-text relative z-10">Fika</span>
			</div>

			<div
				class="apps-slide flex items-start md:col-span-2 md:col-start-3 md:row-span-1 md:row-start-3 md:block">
				<span class="title-text relative z-10">Apps</span>
			</div>
		</div>
	</header>

	<div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
		{#each appCards as card}
			<AppCard {...card} />
		{/each}
	</div>
</div>

<br />
<br />

<style>
	.calc-grid {
		height: calc(100vh - 64px); /* Adjust 64px to match your TopNav height */
	}
	.fika-slide {
		animation: fikaSlide 3s ease-out forwards;
		opacity: 0;
	}

	.apps-slide {
		animation: appsSlide 3s ease-out forwards;
		opacity: 0;
	}

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
		font-size: 9rem;
		font-weight: 700;
	}

	@keyframes fikaSlide {
		from {
			transform: translateX(-1000px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes appsSlide {
		from {
			transform: translateX(1000px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
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
