<script>
	let { image, alt = 'image', title = '', description = '', href = '', learn = '' } = $props();
</script>

<div class="perspective-[1000px] back-color mx-auto w-full max-w-[448px]">
	<div
		class="group card w-full bg-base-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
		<figure class="relative overflow-hidden">
			<a
				href={href || '#'}
				target="_blank"
				rel="noopener noreferrer"
				class="block h-full w-full cursor-pointer">
				<img
					src={image}
					{alt}
					class="h-56 w-full scale-110 object-cover transition-transform duration-500 group-hover:scale-100" />
				<div
					class="absolute inset-0 bg-gradient-to-b from-transparent to-base-300/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
				</div>
			</a>
		</figure>

		<div class="back-color card-body rounded-b-lg bg-base-100/80 backdrop-blur-sm">
			<h2
				class="card-title text-xl font-bold transition-colors duration-300 group-hover:text-primary">
				{title}
			</h2>
			<p class="text-base-content/80">{description}</p>

			<div class="buttons-container card-actions mt-4 flex justify-between gap-2">
				<a
					href={href || '#'}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-primary flex-1"
					>Explore</a>
				{#if learn}
					<a
						href={learn}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-accent flex-1"
						>Learn More</a>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.back-color {
		background-color: #ffffff;
		/* background-image: url('https://www.transparenttextures.com/patterns/bedge-grunge.png'); */
	}

	/* Desktop: Buttons hidden by default, visible on hover */
	@media (min-width: 768px) {
		.buttons-container {
			opacity: 0;
			transition: opacity 300ms;
		}

		:global(.group:hover) .buttons-container {
			opacity: 1;
		}
	}

	/* Mobile: Buttons always visible */
	@media (max-width: 767px) {
		.buttons-container {
			opacity: 1;
		}
	}
</style>
