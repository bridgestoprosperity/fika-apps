<script>
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { PmTilesSource } from 'mapbox-pmtiles';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	import b2pLogo from '$lib/images/b2p-full-logo.png';
	import bplLogo from '$lib/images/bpl-logo.png';
	import { palettes } from '$lib/colorPalettes';

	console.log('Component script starting');

	let map;
	let mapContainer;

	let mapState = $state({
		streamOrder: 0,
		vectorData: true,
		rasterData: true,
		selectedPalette: 'inferno',
		satelliteImagery: false,
		satStyle: 'Color',
		vectorStyle: 'Stream Order'
	});

	// Derived values for layer visibility
	let vectorVisibility = $derived(mapState.vectorData ? 'visible' : 'none');
	let rasterVisibility = $derived(mapState.rasterData ? 'visible' : 'none');
	let satelliteVisibility = $derived(mapState.satelliteImagery ? 'visible' : 'none');
	let vectorLineColor = $derived(
		mapState.vectorStyle === 'Stream Order'
			? [
					'match',
					['get', 'stream_order'],
					[0],
					palettes.violetocean[0],
					[1],
					palettes.violetocean[1],
					[2],
					palettes.violetocean[2],
					[3],
					palettes.violetocean[3],
					[4],
					palettes.violetocean[4],
					[5],
					palettes.violetocean[5],
					[6],
					palettes.violetocean[6],
					[7],
					palettes.violetocean[7],
					[8],
					palettes.violetocean[8],
					palettes.violetocean[9]
				]
			: ['case', ['==', ['get', 'from_tdx'], true], '#0C7BDC', '#FFCE00']
	);
	let rasterPaint = $derived(
		mapState.rasterData
			? {
					'raster-color': [
						'interpolate',
						['linear'],
						['raster-value'],
						38,
						palettes[mapState.selectedPalette][0],
						64,
						palettes[mapState.selectedPalette][1],
						128,
						palettes[mapState.selectedPalette][2],
						192,
						palettes[mapState.selectedPalette][3],
						217,
						palettes[mapState.selectedPalette][4]
					],
					'raster-color-mix': [256, 0, 0, 0],
					'raster-color-range': [0, 256]
				}
			: {}
	);
	let satelliteSaturation = $derived(mapState.satStyle === 'Black and White' ? -1 : 0);

	const createVectorLayer = () => ({
		id: 'vector-waternet',
		source: 'waterways',
		'source-layer': 'waterways',
		type: 'line',
		filter: [
			'all',
			['!=', ['get', 'intersects_lake'], true],
			['any', ['==', ['get', 'stream_order'], 1], ['>=', ['zoom'], 4]]
		],
		layout: {
			'line-join': 'round',
			'line-cap': 'round',
			visibility: mapState.vectorData ? 'visible' : 'none'
		},
		paint: {
			'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.1, 12, 2],
			'line-color': vectorLineColor // Use initial derived color
		}
	});

	const createRasterLayer = () => ({
		id: 'raster-waternet',
		type: 'raster',
		source: {
			type: 'raster',
			tiles: ['https://public-b2p-geodata.s3.amazonaws.com/waternet-raster-tiles/{z}/{x}/{y}.png'],
			tileSize: 256
		},
		layout: {
			visibility: mapState.rasterData ? 'visible' : 'none'
		},
		paint: rasterPaint // Use initial derived paint properties
	});
	const createSatelliteLayer = () => ({
		id: 'satellite-layer',
		type: 'raster',
		source: {
			type: 'raster',
			url: 'mapbox://mapbox.satellite',
			tileSize: 256
		},
		layout: {
			visibility: mapState.satelliteImagery ? 'visible' : 'none'
		},
		paint: {
			'raster-saturation': satelliteSaturation // Use initial derived saturation
		}
	});

	// Effect to update layer properties when they change
	$effect(() => {
		console.log('Effect triggered, visibility states:', {
			satellite: satelliteVisibility,
			vector: vectorVisibility,
			raster: rasterVisibility
		});

		if (!map) return;

		// Satellite layer
		if (map.getLayer('satellite-layer')) {
			console.log('Updating satellite layer visibility to:', satelliteVisibility);
			map.setLayoutProperty('satellite-layer', 'visibility', satelliteVisibility);
			if (mapState.satelliteImagery) {
				map.setPaintProperty('satellite-layer', 'raster-saturation', satelliteSaturation);
			}
		}

		// Vector layer
		if (map.getLayer('vector-waternet')) {
			console.log('Updating vector layer visibility to:', vectorVisibility);
			map.setLayoutProperty('vector-waternet', 'visibility', vectorVisibility);
			if (mapState.vectorData) {
				map.setPaintProperty('vector-waternet', 'line-color', vectorLineColor);
			}
		}

		// Raster layer
		if (map.getLayer('raster-waternet')) {
			console.log('Updating raster layer visibility to:', rasterVisibility);
			map.setLayoutProperty('raster-waternet', 'visibility', rasterVisibility);
			if (mapState.rasterData) {
				Object.entries(rasterPaint).forEach(([key, value]) => {
					map.setPaintProperty('raster-waternet', key, value);
				});
			}
		}
	});
    

	onMount(() => {
		console.log('onMount called');

		mapboxgl.Style.setSourceType(PmTilesSource.SOURCE_TYPE, PmTilesSource);
		console.log('PmTilesSource setup complete');

		try {
			mapboxgl.accessToken =
				'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjbTJ1d2Rka3cwNTM5MmxxMWExZmo2OG1tIn0.B6fDwi43tGjtDzyFSrncxQ';
			map = new mapboxgl.Map({
				container: mapContainer,
				style: 'mapbox://styles/bridgestoprosperity/cm4kippxv01k101slb7hs8mvr',
				center: [26.19, -0.21],
				zoom: 4,
				hash: true
			});
			console.log('Map instance created');

			// Add error handler
			map.on('error', (e) => {
				console.error('Mapbox error:', e);
			});

			// Add style loading handlers
			map.on('styledata', () => {
				console.log('Style data loaded');
			});

			map.on('load', async () => {
				console.log('Map load event fired');

				try {
					// Add satellite layer first
					console.log('Adding satellite layer...');
					map.addLayer(createSatelliteLayer());
					const PMTILES_URL =
						'https://public-b2p-geodata.s3.us-east-1.amazonaws.com/waternet-vector/waterway_model_outputs_20m_vector.pmtiles';
					console.log('Fetching PMTiles header...');

					const header = await PmTilesSource.getHeader(PMTILES_URL);
					console.log('PMTiles header received:', header);

					const bounds = [header.minLon, header.minLat, header.maxLon, header.maxLat];

					console.log('Adding waterways source...');
					map.addSource('waterways', {
						type: PmTilesSource.SOURCE_TYPE,
						url: PMTILES_URL,
						minzoom: header.minZoom,
						maxzoom: header.maxZoom,
						bounds: bounds
					});
					console.log('Waterways source added');

					console.log('Adding layers...');
					map.addLayer(createVectorLayer());
					map.addLayer(createRasterLayer());
					console.log('Layers added');

					// Log the current map state
					console.log('Current sources:', Object.keys(map.getStyle().sources));
					console.log(
						'Current layers:',
						map.getStyle().layers.map((l) => l.id)
					);
					console.log('Current map style:', map.getStyle());
					console.log(mapState);
				} catch (error) {
					console.error('Error in map load handler:', error);
				}
			});
		} catch (error) {
			console.error('Error creating map:', error);
		}
	});

	onDestroy(() => {
		console.log('onDestroy called');
		if (map) {
			map.remove();
			console.log('Map removed');
		}
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={mapContainer} class="absolute inset-0 h-full w-full"></div>
</div>

<div class="absolute left-0 top-[30%] z-10">
	<ControlPanel>
		<div class="justify-left flex items-center">
			<img src={b2pLogo} alt="Bridges to Prosperity" class="mx-2 h-auto w-[40%]" />
			<img src={bplLogo} alt="Bridging the Prosperity Gap" class="mx-2 h-auto w-[45%]" />
		</div>

		<p class="font-medium">Data Visualized</p>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text font-mono">Raster Data</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onchange={(e) => (mapState.rasterData = e.target.checked)}
					checked={mapState.rasterData} />
			</label>
		</div>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text font-mono">Satellite Imagery</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onchange={(e) => (mapState.satelliteImagery = e.target.checked)}
					checked={mapState.satelliteImagery} />
			</label>
		</div>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text font-mono">Vector Data</span>
				<input
					type="checkbox"
					class="toggle toggle-primary [--tglbg:#e8e8e8]"
					onchange={(e) => (mapState.vectorData = e.target.checked)}
					checked={mapState.vectorData} />
			</label>
		</div>
		<div class="form-control">
			{#if mapState.vectorData == true || mapState.satelliteImagery == true || mapState.rasterData == true}
				<div class="divider"></div>
			{/if}
			{#if mapState.rasterData == true}
				<div class="label">
					<span class="label-text">Raster Data Style</span>
				</div>
				<select
					class="select select-bordered select-primary p-2"
					value={mapState.selectedPalette}
					onchange={(e) => (mapState.selectedPalette = e.target.value)}>
					{#each Object.keys(palettes) as paletteName}
						<option value={paletteName}>{paletteName}</option>
					{/each}
				</select>
			{/if}
			{#if mapState.satelliteImagery == true}
				<div class="label">
					<span class="label-text">Satellite Data Style</span>
				</div>
				<select
					class="select select-bordered select-primary p-2"
					value={mapState.satStyle}
					onchange={(e) => (mapState.satStyle = e.target.value)}>
					<option>Black and White</option>
					<option>Color</option>
				</select>
			{/if}
			{#if mapState.vectorData == true}
				<div class="label">
					<span class="label-text">Vector Data Style</span>
				</div>
				<select
					class="select select-bordered select-primary p-2"
					value={mapState.vectorStyle}
					onchange={(e) => (mapState.vectorStyle = e.target.value)}>
					<option>Stream Order</option>
					<option>TDX Hydro Comparison</option>
				</select>
				<div class="divider"></div>
				<div class="label">
					<div class="font-mono text-lg font-bold text-gray-800">
						Stream Order: {mapState.streamOrder}
					</div>
				</div>
			{/if}
		</div>
	</ControlPanel>
</div>

<style>
</style>
