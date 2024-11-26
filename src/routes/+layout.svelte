<script>
	import '../app.css';
	let { children, data } = $props();
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { inject } from '@vercel/analytics';
	import { webVitals } from '$lib/vitals';
	import Header from './Header.svelte';

	$effect(() => {
		if (browser) {
			inject(); // Inject Vercel Analytics

			if (data?.analyticsId) {
				webVitals({
					path: $page.url.pathname,
					params: $page.params,
					analyticsId: data.analyticsId
				});
			}
		}
	});
</script>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer></footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
