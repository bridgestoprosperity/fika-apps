<script>
	import { zambiaMapState } from '$lib/utils/state.svelte.js';

	let { getMapController } = $props();

	let currentStep = $state(0);
	let transitioning = $state(false);

	const steps = [
		{
			title: 'Welcome to Itezhi-Tezhi District',
			narrative:
				'This analysis covers a rural district in Zambia\'s Southern Province, home to hundreds of small communities spread across a vast landscape. Here, each hexagonal cell represents a community area with detailed demographic and accessibility data.',
			detail:
				'The map shows population density — darker areas indicate more people. In rural Zambia, communities are often small and scattered, making infrastructure decisions critical.',
			camera: { center: [26.075, -15.556], zoom: 10.5, pitch: 0, bearing: 0, speed: 0.8 },
			metric: 'population'
		},
		{
			title: 'Understanding Poverty & Vulnerability',
			narrative:
				'The Relative Wealth Index reveals deep economic disparities across the district. Red and yellow areas indicate the poorest communities — the ones most in need of improved infrastructure.',
			detail:
				'These communities face compounding challenges: low wealth correlates with limited access to healthcare, education, and economic opportunities. Transportation infrastructure is a key lever for breaking this cycle.',
			camera: { center: [26.075, -15.556], zoom: 11.5, pitch: 30, bearing: -15, speed: 0.6 },
			metric: 'rwi'
		},
		{
			title: 'The Healthcare Access Crisis',
			narrative:
				'Red and yellow hexes represent communities where residents must walk hours to reach the nearest health facility. For a pregnant woman or a child with malaria, these distances can be life-threatening.',
			detail:
				'Some communities face walks of over 2,800 minutes (nearly 2 full days) to reach healthcare. Even facilities classified as "nearby" require walks that would be measured in hours, not minutes.',
			camera: { center: [26.06, -15.57], zoom: 12.5, pitch: 35, bearing: 10, speed: 0.6 },
			metric: 'travel_time_all_health'
		},
		{
			title: 'Children & Education Access',
			narrative:
				'The same barriers that limit healthcare access also keep children from school. Long, dangerous walking routes — often requiring river crossings — mean missed school days, lower attendance, and ultimately lower educational attainment.',
			detail:
				'Female educational attainment in the district averages just 7 years. Reducing travel time to school directly increases enrollment and attendance, particularly for girls.',
			camera: { center: [26.09, -15.55], zoom: 12.5, pitch: 35, bearing: -10, speed: 0.6 },
			metric: 'travel_time_all_education'
		},
		{
			title: 'How Bridges Change Everything',
			narrative:
				'Our model identifies locations where trail bridges would have the greatest impact on travel times. Green areas show communities where bridges significantly reduce walking distances to essential services.',
			detail:
				'Bridge impact is measured as the total minutes saved reaching both healthcare and education facilities. Even modest time savings — 15 to 30 minutes each way — compound into hundreds of hours saved per year for an entire community.',
			camera: { center: [26.075, -15.556], zoom: 12, pitch: 50, bearing: 20, speed: 0.6 },
			metric: 'impact'
		},
		{
			title: 'A Community Transformed',
			narrative:
				'This community of 38 people currently walks nearly 4.5 hours to reach the nearest school. With a single bridge, that journey drops by almost 2 hours — saving 117 minutes each way.',
			detail:
				'Click on any hex in interactive mode to see detailed impact data, including population demographics, travel times with and without bridges, and the specific bridges and facilities involved.',
			camera: { center: [26.073, -15.569], zoom: 14, pitch: 55, bearing: 30, speed: 0.5 },
			metric: 'impact',
			action: 'clickHex',
			actionTarget: '889628b705fffff'
		},
		{
			title: 'Predicted Bridge Sites',
			narrative:
				'Our custom routing model, developed by Fika, identifies optimal bridge locations by analyzing terrain, river crossings, and population movement patterns. Each predicted bridge site connects multiple communities to essential services.',
			detail:
				'This bridge site connects communities to both Bushinga Rural Health Centre and Bushinga Basic School. In interactive mode, clicking a bridge shows all the communities it serves and the paths it enables.',
			camera: { center: [26.0684, -15.5685], zoom: 14.5, pitch: 50, bearing: -20, speed: 0.5 },
			metric: 'impact',
			action: 'clickBridge',
			actionTarget: 97199
		},
		{
			title: 'Connecting Communities to Care',
			narrative:
				'Bushinga Rural Health Centre serves 167 community areas across the district. Our path modeling shows the actual walking routes people take — and how bridges create shorter, safer alternatives.',
			detail:
				'The dashed lines represent modeled walking paths from communities to this facility. Red paths lead to health facilities, orange to schools. These paths account for terrain, rivers, and existing infrastructure.',
			camera: { center: [26.057, -15.584], zoom: 13, pitch: 45, bearing: 15, speed: 0.5 },
			metric: 'impact',
			action: 'clickDestination',
			actionTarget: 'Bushinga RHC'
		},
		{
			title: 'From Models to Reality',
			narrative:
				'These visualizations represent model predictions based on geospatial analysis, satellite imagery, and population data. Before any bridge is built, our assessment teams travel to these communities to interview residents and validate needs.',
			detail:
				'The assessment process confirms bridge demand, evaluates construction feasibility, and ensures community engagement. Every bridge is built with local labor, creating jobs and ownership. This combination of data-driven planning and community partnership is what makes the impact sustainable.',
			camera: { center: [26.075, -15.556], zoom: 11, pitch: 0, bearing: 0, speed: 0.5 },
			metric: 'population'
		}
	];

	function getController() {
		return getMapController?.();
	}

	function resetMapState() {
		const ctrl = getController();
		if (ctrl?.hexLayerManager) {
			ctrl.hexLayerManager.resetFilters();
		}
		zambiaMapState.dataPanelOpen = false;
	}

	async function goToStep(stepIndex) {
		console.log('goToStep called:', stepIndex, 'transitioning:', transitioning);
		if (transitioning || stepIndex < 0 || stepIndex >= steps.length) return;
		transitioning = true;
		console.log('Starting transition to step', stepIndex);

		try {
			const step = steps[stepIndex];
			const ctrl = getController();
			const map = ctrl?.map;

			// Reset previous highlights before transitioning
			resetMapState();

			// Change metric
			if (step.metric) {
				zambiaMapState.selectedMetric = step.metric;
			}

			// Animate camera
			if (map && step.camera) {
				await Promise.race([
					new Promise((resolve) => {
						map.once('moveend', resolve);
						map.flyTo({
							center: step.camera.center,
							zoom: step.camera.zoom,
							pitch: step.camera.pitch || 0,
							bearing: step.camera.bearing || 0,
							speed: step.camera.speed || 0.6,
							essential: true
						});
					}),
					new Promise((resolve) => setTimeout(resolve, 5000)) // 5s timeout
				]);
			}

			// Execute action after camera settles
			if (step.action && ctrl) {
				await new Promise((r) => setTimeout(r, 400));
				executeAction(step, ctrl);
			}

			currentStep = stepIndex;
		} catch (error) {
			console.error('Error in goToStep:', error);
		} finally {
			transitioning = false;
			console.log('Transition complete, now at step', currentStep);
		}
	}

	function executeAction(step, ctrl) {
		const map = ctrl.map;
		if (!map) return;

		if (step.action === 'clickHex') {
			const source = map.getSource('hex-source');
			if (!source) return;
			// Query for the hex with matching h3_index
			const features = map.queryRenderedFeatures({ layers: ['hex-layer'] });
			const target = features.find((f) => f.properties.h3_index === step.actionTarget);
			if (target) {
				const props = target.properties;
				zambiaMapState.selectedHexData = target;
				zambiaMapState.filterMode = true;
				zambiaMapState.clickedFeatureType = 'hex';
				zambiaMapState.dataPanelOpen = true;
				ctrl.hexLayerManager.highlightSelectedHex(props.h3_index);
			}
		} else if (step.action === 'clickBridge') {
			const features = map.queryRenderedFeatures({ layers: ['bridge-layer'] });
			const target = features.find(
				(f) => f.properties.bridge_index === step.actionTarget
			);
			if (target) {
				zambiaMapState.selectedBridgeData = target;
				zambiaMapState.filterMode = true;
				zambiaMapState.clickedFeatureType = 'bridge';
				zambiaMapState.dataPanelOpen = true;
				ctrl.bridgeLayerManager.highlightSelectedBridge(step.actionTarget);
			}
		} else if (step.action === 'clickDestination') {
			const features = map.queryRenderedFeatures({
				layers: ['destination-layer']
			});
			const target = features.find((f) =>
				f.properties.name?.trim() === step.actionTarget?.trim()
			);
			if (target) {
				zambiaMapState.selectedDestinationData = target;
				zambiaMapState.filterMode = true;
				zambiaMapState.clickedFeatureType = 'destination';
				zambiaMapState.dataPanelOpen = true;
				ctrl.destinationLayerManager.highlightSelectedDestination(target.id);

				// Show paths to this destination
				const destIndex = target.properties.facility_type === 'school'
					? target.properties.all_education_facilities_index
					: target.properties.all_health_facilities_index;
				if (ctrl.pathLayerManager && destIndex) {
					ctrl.pathLayerManager.displayPathsToDestination(destIndex);
					zambiaMapState.pathsVisible = true;
				}
			}
		}
	}

	function nextStep() {
		if (currentStep < steps.length - 1) {
			goToStep(currentStep + 1);
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			goToStep(currentStep - 1);
		}
	}

	function exitWalkthrough() {
		resetMapState();
		zambiaMapState.walkthroughActive = false;
		zambiaMapState.selectedMetric = 'population';

		const ctrl = getController();
		if (ctrl?.map) {
			ctrl.map.flyTo({
				center: [26.099, -15.533],
				zoom: 12,
				pitch: 0,
				bearing: 0,
				speed: 0.8
			});
		}
	}

	// Start walkthrough on mount
	$effect(() => {
		if (zambiaMapState.walkthroughActive) {
			currentStep = 0;
			transitioning = false; // Ensure not stuck in transition on start

			// Wait for map to be ready before first transition
			const ctrl = getController();
			if (ctrl?.map) {
				// Map is ready, do initial setup without transition
				const step = steps[0];
				if (step.metric) {
					zambiaMapState.selectedMetric = step.metric;
				}
				// Optional: Animate to initial position
				if (ctrl.map && step.camera) {
					ctrl.map.flyTo({
						center: step.camera.center,
						zoom: step.camera.zoom,
						pitch: step.camera.pitch || 0,
						bearing: step.camera.bearing || 0,
						speed: step.camera.speed || 0.6,
						essential: true
					});
				}
			}
		}
	});
</script>

{#if zambiaMapState.walkthroughActive}
	<div class="walkthrough-overlay">
		<div class="walkthrough-card">
			<!-- Step counter -->
			<div class="step-counter">
				<span>Step {currentStep + 1} of {steps.length}</span>
				<button onclick={exitWalkthrough} class="exit-btn">Exit Tour</button>
			</div>

			<!-- Progress bar -->
			<div class="progress-bar">
				<div
					class="progress-fill"
					style="width: {((currentStep + 1) / steps.length) * 100}%"
				></div>
			</div>

			<!-- Content -->
			<div class="step-content">
				<h2 class="step-title">{steps[currentStep].title}</h2>
				<p class="step-narrative">{steps[currentStep].narrative}</p>
				<p class="step-detail">{steps[currentStep].detail}</p>
			</div>

			<!-- Navigation -->
			<div class="step-nav">
				<button
					onclick={prevStep}
					disabled={currentStep === 0 || transitioning}
					class="nav-btn prev-btn"
				>
					Previous
				</button>

				<!-- Progress dots -->
				<div class="dots">
					{#each steps as _, i}
						<button
							onclick={() => goToStep(i)}
							class="dot"
							class:active={i === currentStep}
							class:completed={i < currentStep}
							disabled={transitioning}
							aria-label="Go to step {i + 1}"
						></button>
					{/each}
				</div>

				{#if currentStep < steps.length - 1}
					<button
						onclick={nextStep}
						disabled={transitioning}
						class="nav-btn next-btn"
					>
						Next
					</button>
				{:else}
					<button
						onclick={exitWalkthrough}
						class="nav-btn next-btn finish-btn"
					>
						Explore Map
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.walkthrough-overlay {
		position: absolute;
		bottom: 32px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 60;
		pointer-events: none;
	}

	.walkthrough-card {
		width: 520px;
		max-width: 90vw;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 12px;
		padding: 20px 24px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
		pointer-events: auto;
		animation: slideUp 0.4s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.step-counter {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.step-counter span {
		font-size: 11px;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-family: 'Source Code Pro', monospace;
	}

	.exit-btn {
		font-size: 11px;
		color: #9ca3af;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
		transition: all 0.2s;
		font-family: 'Kumbh Sans', sans-serif;
	}

	.exit-btn:hover {
		color: #374151;
		background: rgba(0, 0, 0, 0.04);
	}

	.progress-bar {
		height: 3px;
		background: #e5e7eb;
		border-radius: 2px;
		margin-bottom: 16px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #009149;
		border-radius: 2px;
		transition: width 0.5s ease;
	}

	.step-content {
		margin-bottom: 16px;
	}

	.step-title {
		font-size: 18px;
		font-weight: 700;
		color: #111827;
		margin: 0 0 8px;
		font-family: 'Kumbh Sans', sans-serif;
		line-height: 1.3;
	}

	.step-narrative {
		font-size: 14px;
		color: #374151;
		line-height: 1.6;
		margin: 0 0 8px;
	}

	.step-detail {
		font-size: 12px;
		color: #6b7280;
		line-height: 1.5;
		margin: 0;
		font-style: italic;
	}

	.step-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}

	.nav-btn {
		padding: 8px 20px;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-family: 'Kumbh Sans', sans-serif;
		min-width: 90px;
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.prev-btn {
		background: #f3f4f6;
		color: #374151;
	}

	.prev-btn:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.next-btn {
		background: #009149;
		color: white;
	}

	.next-btn:hover:not(:disabled) {
		background: #007a3d;
	}

	.finish-btn {
		background: #161345;
	}

	.finish-btn:hover:not(:disabled) {
		background: #1e1a5e;
	}

	.dots {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: none;
		background: #d1d5db;
		cursor: pointer;
		padding: 0;
		transition: all 0.3s;
	}

	.dot.active {
		background: #009149;
		transform: scale(1.3);
	}

	.dot.completed {
		background: #86efac;
	}

	.dot:hover:not(:disabled) {
		background: #009149;
		opacity: 0.7;
	}
</style>
