<script>
	import { untrack } from 'svelte';
	import { XmarkSolid } from 'svelte-awesome-icons';
	import { printState, impactMapState } from '$lib/utils/state.svelte.js';
	import PrintOptions from './PrintOptions.svelte';
	import PrintPreview from './PrintPreview.svelte';

	let isLayout = $derived(printState.tab === 'layout');

	$effect(() => {
		if (printState.open) {
			untrack(() => {
				if (!printState.title) {
					printState.title = impactMapState.dataName || 'Fika Impact Map';
				}
			});
		}
	});

	function close() {
		printState.open = false;
	}

	function handleExport() {
		// Step 4 wires this to PrintService. For now just show what would be exported.
		console.log('Export requested:', $state.snapshot(printState));
	}

	function handleKeydown(e) {
		if (printState.open && e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if printState.open}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && close()}>
		<div
			class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="print-dialog-title">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
				<h2 id="print-dialog-title" class="text-xl font-bold text-secondary">Print &amp; export</h2>
				<button class="btn btn-ghost btn-sm" onclick={close} aria-label="Close">
					<XmarkSolid />
				</button>
			</div>

			<!-- Body -->
			<div class="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-5">
				<!-- Preview -->
				<div class="md:col-span-3">
					<PrintPreview />
				</div>

				<!-- Options -->
				<div class="md:col-span-2">
					<div role="tablist" class="tabs tabs-bordered mb-4">
						<button
							role="tab"
							class="tab {isLayout ? 'tab-active font-bold' : ''}"
							onclick={() => (printState.tab = 'layout')}>
							Layout
						</button>
						<button
							role="tab"
							class="tab {!isLayout ? 'tab-active font-bold' : ''}"
							onclick={() => (printState.tab = 'map-only')}>
							Map only
						</button>
					</div>

					<PrintOptions />
				</div>
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
				<span class="mr-auto text-sm text-gray-500">
					{isLayout ? 'Full page layout' : 'Borderless map image'}
				</span>
				<button class="btn btn-ghost" onclick={close}>Cancel</button>
				<button class="btn btn-secondary" onclick={handleExport}>Export</button>
			</div>
		</div>
	</div>
{/if}
