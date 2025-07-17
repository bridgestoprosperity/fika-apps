<script>
	import PercentileBars from '$lib/components/charts/PercentileBars.svelte';

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
</script>

<div class="background-page items-left flex flex-col gap-4 *:m-4">
	<PercentileBars
		activatedBars={getRandomInt(1, 5)}
		neutral={true}
		reverse={false}
		label="Population">
		{#snippet numbers()}
			<span>1.2K people</span>
		{/snippet}
	</PercentileBars>
	<PercentileBars activatedBars={getRandomInt(1, 5)} reverse={true} label="Travel time to school">
		{#snippet numbers()}
			<span>25 mins</span>
		{/snippet}
	</PercentileBars>
	<PercentileBars activatedBars={getRandomInt(1, 5)} reverse={true} label="Travel time to market">
		{#snippet numbers()}
			<span>45 mins</span>
		{/snippet}
	</PercentileBars>
	<PercentileBars
		activatedBars={getRandomInt(1, 5)}
		reverse={true}
		label="Travel time to healthcare">
		{#snippet numbers()}
			<span>32 mins</span>
		{/snippet}
	</PercentileBars>
</div>

<style>
	.background-page {
		background-color: #010d19;
		padding: 20px;
	}
</style>
