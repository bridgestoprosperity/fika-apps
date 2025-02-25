<script lang="ts">
	import { onMount } from 'svelte';

	let {
		src,
		alt,
		className = ''
	} = $props<{
		src: string;
		alt: string;
		className?: string;
	}>();

	let card: HTMLElement;
	let isHovered = $state(false);
	let rotateX = $state(0);
	let rotateY = $state(0);

	const maxRotate = 15;
	const maxScale = 1.0;
	const perspective = 1000;

	function handleMouseMove(event: MouseEvent) {
		if (!card || !isHovered) return;

		const rect = card.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		rotateY = ((x - rect.width / 2) / rect.width) * maxRotate;
		rotateX = -((y - rect.height / 2) / rect.height) * maxRotate;
	}

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
		rotateX = 0;
		rotateY = 0;
	}
</script>

<div
	bind:this={card}
	class="tilt-card {className}"
	style="--tilt-transform: perspective({perspective}px) rotateX({rotateX}deg) rotateY({rotateY}deg) scale({isHovered
		? maxScale
		: 1})"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onmousemove={handleMouseMove}>
	<div class="card-content">
		<img {src} {alt} class="absolute inset-0 h-full w-full rounded-md object-cover" />
		<slot />
	</div>
</div>

<style>
	.tilt-card {
		position: relative;
		transition: transform 0.1s ease-out;
		transform-style: preserve-3d;
		background: var(--card-background, #f0f0f0);
		border-radius: 0.375rem;
		overflow: hidden;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		transform: var(--tilt-transform);
		/* make black and white */
		/* filter: grayscale(30%); */
	}

	.tilt-card:hover {
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		/* remove black and white filter */
		filter: saturate(100%);
	}

	.card-content {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
	}
</style>
