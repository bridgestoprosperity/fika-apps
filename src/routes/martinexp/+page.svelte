<script>
	import { onMount } from 'svelte';
	import mapboxgl from 'mapbox-gl';

	const MAPBOX_TOKEN =
		'pk.eyJ1IjoiYnJpZGdlc3RvcHJvc3Blcml0eSIsImEiOiJjajRpd2sxeGQwMjU5MnhxajJkNzZnODZtIn0.UrOwxq6A1Zl2yvwzYxBudQ';

	const MARTIN_URL = 'http://98.92.93.210:3000';

	let mapContainer;
	let map;

	onMount(() => {
		mapboxgl.accessToken = MAPBOX_TOKEN;

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapbox/light-v11',
			center: [26.19, -0.21],
			zoom: 4,
			hash: true
		});

		map.addControl(new mapboxgl.NavigationControl());

		map.on('load', () => {
			// Use TileJSON URL so Mapbox reads correct bounds/zoom from Martin
			const column = 'rwi'; // this will eventually come from a dropdown

			map.addSource('martin-hex', {
				type: 'vector',
				tiles: [`${MARTIN_URL}/hex_tiles/{z}/{x}/{y}?column=${column}`],
				minzoom: 8,
				maxzoom: 22
			});

			map.addLayer({
				id: 'hex-fill',
				type: 'fill',
				source: 'martin-hex',
				'source-layer': 'hex_tiles', // matches function name
				minzoom: 8,
				maxzoom: 22,
				paint: {
					'fill-color': [
						'case',
						['==', ['get', 'value'], null], // column is now always 'value'
						'#f4f4f4',
						[
							'interpolate',
							['linear'],
							['get', 'value'],
							-3,
							'#d73027',
							-1,
							'#fee08b',
							0,
							'#e8f5e9',
							1,
							'#66bb6a',
							3,
							'#009149'
						]
					],
					'fill-opacity': 0.8
				}
			});

			map.addLayer({
				id: 'hex-outline',
				type: 'line',
				source: 'martin-hex',
				'source-layer': 'hex_tiles',
				minzoom: 8,
				maxzoom: 22,
				paint: {
					'line-color': '#000000',
					'line-opacity': 0.15,
					'line-width': 0.5
				}
			});
		});
		map.on('click', 'hex-fill', (e) => {
			const features = map.queryRenderedFeatures(e.point, {
				layers: ['hex-fill']
			});
			if (!features.length) {
				return;
			}
			const feature = features[0];
			const coordinates = feature.geometry.coordinates.slice();
			const description = `properties: ${JSON.stringify(feature.properties)}`;

			new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(description).addTo(map);
		});

		return () => {
			map.remove();
		};
	});
</script>

<div bind:this={mapContainer} class="map-container"></div>

<style>
	.map-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100vh;
		z-index: 0;
	}
</style>
