<script>
	import { untrack } from 'svelte';
	import { printState } from '$lib/utils/state.svelte.js';
	import { mapRegistry } from '$lib/services/impactmap/mapRegistry.svelte.js';
	import { captureMapSnapshot } from '$lib/services/impactmap/PrintService.svelte.js';
	import { scaleDenominator, formatScale } from '$lib/utils/impactmap/scaleUtils.js';
	import { pageTemplates, pageInches } from '$lib/utils/impactmap/pageTemplates.js';

	let snapshot = $state(null); // { dataUrl, width, height }
	let scaleLabel = $state('');
	let loading = $state(false);
	let error = $state('');
	let showFrame = $state(true);

	let isLayout = $derived(printState.tab === 'layout');

	// Aspect ratio (w / h) of the area that will be exported
	let frameRatio = $derived.by(() => {
		if (isLayout) {
			const t = pageTemplates[printState.template];
			return t ? t.widthMm / t.heightMm : 1;
		}
		return printState.width > 0 && printState.height > 0 ? printState.width / printState.height : 1;
	});

	let sizeLabel = $derived.by(() => {
		if (isLayout) {
			const inches = pageInches(printState.template);
			return inches ? `${inches.width}" × ${inches.height}"` : '';
		}
		return `${printState.width} × ${printState.height} px`;
	});

	// Largest frame of the export aspect ratio that fits inside the snapshot, centred
	let frameStyle = $derived.by(() => {
		if (!snapshot) return '';
		const snapRatio = snapshot.width / snapshot.height;
		let w = 100;
		let h = 100;
		if (frameRatio > snapRatio) {
			h = (snapRatio / frameRatio) * 100;
		} else {
			w = (frameRatio / snapRatio) * 100;
		}
		return `width:${w}%;height:${h}%;left:${(100 - w) / 2}%;top:${(100 - h) / 2}%;`;
	});

	async function refresh() {
		const map = mapRegistry.controller?.map;
		if (!map) {
			error = 'The map is not ready yet.';
			return;
		}

		loading = true;
		error = '';
		try {
			scaleLabel = formatScale(scaleDenominator(map));
			snapshot = await captureMapSnapshot(map);
		} catch (e) {
			console.error('Could not capture map preview:', e);
			error = 'Could not capture the map preview.';
		} finally {
			loading = false;
		}
	}

	// Capture each time the dialog opens
	$effect(() => {
		if (printState.open) {
			untrack(() => refresh());
		}
	});
</script>

<div>
	<div class="flex flex-wrap items-center gap-3">
		<span class="font-bold">Print preview ({sizeLabel})</span>
		{#if scaleLabel}
			<span class="badge badge-info text-white" title="Scale of the current map view">
				Scale {scaleLabel}
			</span>
		{/if}
		<label class="ml-auto flex cursor-pointer items-center gap-2 text-sm">
			<input type="checkbox" class="checkbox checkbox-xs" bind:checked={showFrame} />
			<span>Show print frame</span>
		</label>
	</div>

	<div
		class="relative mt-3 w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
		style={snapshot
			? `aspect-ratio:${snapshot.width} / ${snapshot.height};`
			: 'aspect-ratio:4 / 3;'}>
		{#if snapshot}
			<img src={snapshot.dataUrl} alt="Map preview" class="absolute inset-0 h-full w-full" />
			{#if showFrame}
				<div
					class="pointer-events-none absolute border-2 border-dashed border-secondary"
					style="{frameStyle}box-shadow:0 0 0 9999px rgba(255,255,255,0.55);">
				</div>
			{/if}
		{/if}

		{#if loading || error || !snapshot}
			<div
				class="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-gray-600">
				{error || (loading ? 'Capturing map…' : 'No preview yet')}
			</div>
		{/if}
	</div>

	<div class="mt-2 flex items-center justify-between text-sm text-gray-500">
		<span>The dashed frame shows the area that will be captured.</span>
		<button class="btn btn-ghost btn-xs text-info" onclick={refresh} disabled={loading}>
			Refresh
		</button>
	</div>
</div>
