<script>
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import AppCard from '$lib/components/HomePageCard.svelte';
	import TiltCard from '$lib/components/TiltCard.svelte';

	// Import all images individually
	import tile1 from '$lib/images/sites-bolivia.png';
	import tile8 from '$lib/images/sites-sat-central-america.png';
	import tile2 from '$lib/images/sites-single-sat.png';
	import tile4 from '$lib/images/civ-map-only.png';
	import tile3 from '$lib/images/fikamap-maponly.png';
	import tile13 from '$lib/images/waternet-magma-7.png';
	import tile6 from '$lib/images/waternet-blue-1.png';
	import tile10 from '$lib/images/waternet-kenya.png';
	import tile5 from '$lib/images/waternet-magma-1.png';
	import tile11 from '$lib/images/waternet-viridis-1.png';
	import tile9 from '$lib/images/waternet-magma-5.png';
	import tile12 from '$lib/images/waternet-magma-6.png';
	import tile7 from '$lib/images/waternet-vector-ethiopia.png';
	import waternetVectorEthiopia from '$lib/images/waternet-vector-ethiopia.png';
	import civAppImage from '$lib/images/civ-maponly-flood.png';
	import fikaMapAppImage from '$lib/images/fikamap-maponly.png';
	import bridgeSitesAppImage from '$lib/images/sites-zoom-sat.png';
	import waternetAppImage from '$lib/images/waternet-magma-4.png';

	let isLoaded = $state(false);

	// Define grid items for better maintainability
	const gridItems = [
		{
			src: tile1,
			alt: 'tile 1',
			className:
				'slide-from-left animation-delay-300 col-span-2 col-start-1 row-start-1 md:col-span-2 md:col-start-1 md:row-start-1'
		},
		{
			src: tile2,
			alt: 'tile 2',
			className:
				'slide-from-bottom animation-delay-100 col-span-2 col-start-2 row-span-2 row-start-1 md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-1'
		},
		{
			src: tile3,
			alt: 'tile 3',
			className:
				'slide-from-top animation-delay-300 col-start-1 row-start-2 md:col-span-1 md:col-start-4 md:row-span-2 md:row-start-1'
		},
		{
			src: tile4,
			alt: 'tile 4',
			className:
				'slide-from-left animation-delay-0 col-span-2 col-start-1 row-start-3 md:col-span-1 md:col-start-5 md:row-span-1 md:row-start-1'
		},
		{
			src: tile5,
			alt: 'tile 5',
			className:
				'slide-from-top animation-delay-100 col-start-2 row-start-5 md:col-span-1 md:col-start-1 md:row-span-1 md:row-start-2'
		},
		{
			src: tile6,
			alt: 'Tile 6',
			className:
				'slide-from-right animation-delay-300 col-span-2 col-start-2 row-start-4 md:col-span-1 md:col-start-5 md:row-span-1 md:row-start-2'
		},
		{
			src: tile7,
			alt: 'Tile 7',
			className:
				'slide-from-left animation-delay-200 col-start-1 row-span-2 row-start-4 md:col-span-1 md:col-start-1 md:row-span-2 md:row-start-3'
		},
		{
			src: tile8,
			alt: 'Tile 8',
			className:
				'slide-from-bottom animation-delay-300 col-start-3 row-start-3 md:col-span-1 md:col-start-2 md:row-span-2 md:row-start-3'
		},
		{
			src: tile9,
			alt: 'Tile 9',
			className:
				'slide-from-left animation-delay-100 hidden md:col-span-1 md:col-start-3 md:row-span-1 md:row-start-4 md:block'
		},
		{
			src: tile10,
			alt: 'Tile 10',
			className:
				'slide-from-right animation-delay-200 hidden md:col-span-1 md:col-start-4 md:row-span-1 md:row-start-4 md:block'
		},
		{
			src: tile11,
			alt: 'Tile 11',
			className:
				'slide-from-top hidden md:col-span-1 md:col-start-5 md:row-span-2 md:row-start-3 md:block'
		}
	];

	const appCards = [
		{
			image: waternetAppImage,
			alt: 'Waterway Explorer example',
			title: 'Waterways Data Explorer App',
			description: 'An application allowing you to explore waterways data created by Waternet',
			href: '/waternet'
		},
		{
			image: fikaMapAppImage,
			alt: 'Fika Map example',
			title: 'Fika Impact Map',
			description:
				'Prototype of a map application allowing user to visualize impact of trail bridges on communities around Rwanda',
			href: 'https://map.fikamap.com/'
		},
		{
			image: civAppImage,
			alt: "Côte d'Ivoire",
			title: "Côte d'Ivoire Bridge Impact Assessment",
			description:
				'Analysis done to determine where bridges are needed to support new schools built in Côte d’Ivoire',
			href: 'https://bridgestoprosperity.github.io/civ-map/home/'
		},
		{
			image: bridgeSitesAppImage,
			alt: 'map of ethiopia',
			title: 'Bridges Built Worldwide',
			description: 'Locations of bridges built by 	Bridges to Prosperity around the world',
			href: 'https://bridge-locations-map.vercel.app/'
		}
	];

	$effect(() => {
		isLoaded = true;
	});
</script>

<div class="background-texture flex min-h-screen flex-col">
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
				class="fika-slide flex items-center justify-center rounded-md md:col-span-2 md:col-start-2 md:row-span-1 md:row-start-2">
				<span class="title-text relative z-10">Fika</span>
			</div>

			<div
				class="apps-slide flex items-center justify-center md:col-span-2 md:col-start-3 md:row-span-1 md:row-start-3 ">
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
		animation: fikaSlide 1.5s ease-out forwards;
		opacity: 0;
	}

	.apps-slide {
		animation: appsSlide 1.5s ease-out forwards;
		opacity: 0;
	}

	.slide-from-top {
		animation: slideFromTop 0.8s ease-out forwards;
		opacity: 0;
	}

	.slide-from-right {
		animation: slideFromRight 0.8s ease-out forwards;
		opacity: 0;
	}

	.slide-from-bottom {
		animation: slideFromBottom 0.8s ease-out forwards;
		opacity: 0;
	}

	.slide-from-left {
		animation: slideFromLeft 0.8s ease-out forwards;
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
		line-height: .8;
	}

	/* .background-texture {
		background-color: #ffffff4b;
		background-image: url('https://www.transparenttextures.com/patterns/bedge-grunge.png');
	} */

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
