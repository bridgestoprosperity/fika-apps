<script>
	let { image, alt = 'image', title = '', description = '', href = '' } = $props();
</script>

<div class="perspective-[1000px]">
	<a
		{href}
		class="group card block w-96 bg-base-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
		<figure class="relative overflow-hidden">
			<img
				src={image}
				{alt}
				class="h-56 w-full object-cover transition-transform scale-110 duration-500 group-hover:scale-100" />
			<div
				class="absolute inset-0 bg-gradient-to-b from-transparent to-base-300/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
			</div>
		</figure>

		<div class="card-body bg-base-100/80 backdrop-blur-sm rounded-b-lg">
			<h2
				class="card-title text-xl font-bold transition-colors duration-300 group-hover:text-primary">
				{title}
			</h2>
			<p class="text-base-content/80">{description}</p>
		</div>
	</a>
</div>
