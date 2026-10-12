<script>
	import { printState } from '$lib/utils/state.svelte.js';
	import { pageTemplates, dpiOptions } from '$lib/utils/impactmap/pageTemplates.js';

	const layoutFormats = [
		{ value: 'pdf', label: 'PDF' },
		{ value: 'png', label: 'PNG' }
	];
	const mapOnlyFormats = [
		{ value: 'png', label: 'PNG' },
		{ value: 'jpg', label: 'JPG' },
		{ value: 'pdf', label: 'PDF' }
	];

	let isLayout = $derived(printState.tab === 'layout');
	let formats = $derived(isLayout ? layoutFormats : mapOnlyFormats);

	// Keep the selected format valid when switching tabs
	$effect(() => {
		if (!formats.some((f) => f.value === printState.format)) {
			printState.format = formats[0].value;
		}
	});

	function swapSize() {
		[printState.width, printState.height] = [printState.height, printState.width];
	}
</script>

<div class="space-y-4">
	<div>
		<label class="font-bold" for="print-title">Title</label>
		<input
			id="print-title"
			type="text"
			class="input input-bordered mt-2 w-full"
			placeholder="Map title"
			bind:value={printState.title} />
	</div>

	{#if isLayout}
		<div>
			<label class="font-bold" for="print-template">Template</label>
			<select
				id="print-template"
				class="select select-bordered mt-2 w-full"
				bind:value={printState.template}>
				{#each Object.entries(pageTemplates) as [key, t]}
					<option value={key}>{t.label}</option>
				{/each}
			</select>
		</div>
	{/if}

	<div>
		<label class="font-bold" for="print-format">File format</label>
		<select
			id="print-format"
			class="select select-bordered mt-2 w-full"
			bind:value={printState.format}>
			{#each formats as f}
				<option value={f.value}>{f.label}</option>
			{/each}
		</select>
	</div>

	{#if !isLayout}
		<div class="flex items-end gap-2">
			<div class="flex-1">
				<label class="font-bold" for="print-width">Width (px)</label>
				<input
					id="print-width"
					type="number"
					min="200"
					max="8000"
					class="input input-bordered mt-2 w-full"
					bind:value={printState.width} />
			</div>
			<button
				class="btn btn-outline btn-sm mb-2"
				onclick={swapSize}
				aria-label="Swap width and height">
				⇄
			</button>
			<div class="flex-1">
				<label class="font-bold" for="print-height">Height (px)</label>
				<input
					id="print-height"
					type="number"
					min="200"
					max="8000"
					class="input input-bordered mt-2 w-full"
					bind:value={printState.height} />
			</div>
		</div>
	{:else}
		<p class="text-sm text-gray-500">
			Width and height follow the page template. Use "Map only" to set exact pixel sizes.
		</p>
	{/if}

	<fieldset class="rounded-lg border border-gray-300 p-3">
		<legend class="px-1 text-xs font-bold uppercase tracking-wide text-gray-500">
			Advanced options
		</legend>

		<label class="flex cursor-pointer items-center gap-2 py-1">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={printState.setScale} />
			<span>Set scale</span>
		</label>

		<p class="mt-2 text-sm font-bold">DPI (resolution)</p>
		<div class="mt-1 flex gap-2">
			{#each dpiOptions as dpi}
				<button
					class="btn btn-sm {printState.dpi === dpi
						? 'btn-secondary'
						: 'btn-outline btn-secondary'}"
					onclick={() => (printState.dpi = dpi)}>
					{dpi}
				</button>
			{/each}
		</div>

		<label class="mt-3 flex cursor-pointer items-center gap-2 py-1">
			<input
				type="checkbox"
				class="checkbox checkbox-sm"
				bind:checked={printState.includeAttribution} />
			<span>Include attribution</span>
		</label>

		{#if isLayout}
			<label class="flex cursor-pointer items-center gap-2 py-1">
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					bind:checked={printState.includeLegend} />
				<span>Include legend</span>
			</label>
			<label class="flex cursor-pointer items-center gap-2 py-1">
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					bind:checked={printState.includeSelectedHex} />
				<span>Include selected hex data</span>
			</label>
		{/if}
	</fieldset>
</div>
