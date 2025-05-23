<script>
	// Accept either colors directly or a palette array
	let { colors = undefined, name, showScale = false, scale, palette } = $props();

	// If palette is provided but not colors, use the palette
	let displayColors = $derived(palette && !colors ? palette : colors);

	// Optional: Format scale values for display
	function formatValue(value) {
		return typeof value === 'number' ? value.toFixed(1) : value;
	}
</script>

<div class="flex flex-col gap-1">
	{#if displayColors}
		<div
			class="h-4 w-full rounded-sm"
			style="background: linear-gradient(to right, {displayColors.join(', ')})" />
	{:else}
		<div class="h-4 w-full rounded-sm bg-gray-200"></div>
	{/if}

	{#if showScale && scale}
		<div class="flex justify-between text-xs">
			<span>{formatValue(scale.min)}</span>
			<span>{formatValue(scale.max)}</span>
		</div>
	{/if}
</div>
