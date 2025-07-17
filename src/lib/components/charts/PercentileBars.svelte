<script>
	let { activatedBars = 0, neutral = false, reverse = false, label = 'population' } = $props();

	let mounted = $state(false);

	const getBarColor = (barIndex, activatedCount, isReverse, isNeutral) => {
		const isActivated = barIndex >= 5 - activatedCount;

		if (!isActivated) return '#D7D1CB';

		const colorCount = isReverse ? 5 - activatedCount + 1 : activatedCount;

		if (isNeutral) return '#161345';
		if (colorCount <= 2) return '#EA7149';
		if (colorCount === 3) return '#F4B42A';
		return '#009149';
	};

	const getBarWidth = (barIndex, activatedCount, isReverse) => {
		const isActivated = barIndex >= 5 - activatedCount;

		if (!isActivated) return 600;

		// The "top" activated bar is always the one with the highest index that's activated
		const topActivatedIndex = 5 - activatedCount;
		const isTopActivatedBar = barIndex === topActivatedIndex;

		return isTopActivatedBar ? 800 : 600;
	};

	setTimeout(() => {
		mounted = true;
	}, 100);
</script>

<div class="chip-container">
	<div class="content-section">
		<div class="bars-container">
			{#each Array(5) as _, i}
				<div class="bar-container" style="animation-delay: {(4 - i) * 150}ms" class:mounted>
					<svg
						width={getBarWidth(i, activatedBars, reverse)}
						height="100"
						viewBox="0 0 {getBarWidth(i, activatedBars, reverse)} 100"
						class="bar-svg">
						<rect
							width={getBarWidth(i, activatedBars, reverse)}
							height="100"
							rx="50"
							fill={getBarColor(i, activatedBars, reverse, neutral)}
							class="bar-rect" />
					</svg>
				</div>
			{/each}
		</div>
		<div class="info-section">
			<div class="numbers-section">
				<slot name="numbers"></slot>
			</div>
			<div class="label">
				{label}
			</div>
		</div>
	</div>
</div>

<style>
	.chip-container {
		background-color: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(5px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 6px;
		display: flex;
		flex-direction: column;
		height: 60px;
		width: 100%;
		box-sizing: border-box;
	}

	.content-section {
		display: flex;
		align-items: stretch;
		gap: 4px;
		height: 100%;
		min-width: 0;
	}

	.bars-container {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
		flex: 1;
		height: 100%;
		min-width: 0;
	}

	.info-section {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		flex: 1;
		height: 100%;
		min-width: 0;
	}

	.bar-container {
		opacity: 0;
		transform: scaleX(0);
		transform-origin: left center;
		height: 8px;
		width: 100%;
	}

	.bar-container.mounted {
		animation: barSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	@keyframes barSlideIn {
		0% {
			opacity: 0;
			transform: scaleX(0);
		}
		100% {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	.bar-svg {
		display: block;
		height: 100%;
		width: auto;
		transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
		margin: 0 auto;
	}

	.bar-rect {
		transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.numbers-section {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		font-family: 'Source Code Pro', monospace;
		font-weight: 500;
		font-size: 0.8em;
		color: #161345;
		white-space: nowrap;
		text-align: left;
		margin-bottom: 0px;
	}

	.label {
		font-family: 'Source Code Pro', monospace;
		font-weight: 400;
		font-size: 0.65em;
		color: #161345;
		opacity: 0.8;
		text-align: left;
		line-height: 1;
		word-wrap: break-word;
		overflow-wrap: break-word;
		hyphens: auto;
		flex: 1;
		display: flex;
		align-items: flex-end;
        padding: 0;
	}
</style>
